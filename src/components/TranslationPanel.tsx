import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import { transcribeAudio } from '../services/api';
import { processChunkedAudio } from '../services/audioProcessing';
import { translateBidirectional } from '../services/bidirectionalTranslation';
import { Copy, Hash, Cpu } from 'lucide-react';
import { copyToClipboard } from '../services/audioUtils';
import { enhancedLanguageDetection, getLanguageName } from '../services/languageDetection';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import FilterStatusNotification from './FilterStatusNotification';
import LanguageDetectionIndicator from './LanguageDetectionIndicator';
import EnhancedTextToSpeechPanel from './EnhancedTextToSpeechPanel';
import TranslationDirectionToggle from './TranslationDirectionToggle';
import TranslationProviderToggle from './TranslationProviderToggle';
import TargetLanguageSelector from './TargetLanguageSelector';
import SourceLanguageSelector from './SourceLanguageSelector';
import UsageCounter from './UsageCounter';
import SignupWallModal from './SignupWallModal';
import CompetenceMeter from './CompetenceMeter';
// TEMPORARILY DISABLED - Continuous recording feature
// import RecordingModeToggle from './RecordingModeToggle';
// import SpeakerManager from './SpeakerManager';
// import ContinuousTranscriptView from './ContinuousTranscriptView';
// import ContinuousAudioRecorder from './ContinuousAudioRecorder';
import { useWasmTextProcessor } from '../hooks/useWasmTextProcessor';
import type { TextAnalysis } from '../types/wasm';
import {
  clearAnonymousUsage
} from '../services/anonymousUsageService';

const TranslationPanel: React.FC = () => {
  const { state, dispatch } = useTranslation();
  const { user } = useAuth();
  const { analyzeText, isInitialized: isWasmReady } = useWasmTextProcessor(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [, setLanguageValidationError] = useState<string>('');
  const [showSignupWall, setShowSignupWall] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = React.useState({
    transcriptionTime: 0,
    translationTime: 0,
    totalTime: 0,
  });
  // WASM text analysis state
  const [originalAnalysis, setOriginalAnalysis] = useState<TextAnalysis | null>(null);
  const [translatedAnalysis, setTranslatedAnalysis] = useState<TextAnalysis | null>(null);
  // Content filter state
  const [filterStatus, setFilterStatus] = useState<{
    wasFiltered: boolean;
    detectedIssues: string[];
    severityLevel: 'none' | 'mild' | 'moderate' | 'severe';
  }>({
    wasFiltered: false,
    detectedIssues: [],
    severityLevel: 'none'
  });
  const [userTier] = useState<'free' | 'paid-uncensored'>('free'); // For now, all users are free tier
  const isProcessingRef = useRef(false);
  const requestIdCounterRef = useRef(0);
  const lastProcessedBlobRef = useRef<Blob | null>(null);

  // Enhanced translation processing with chunked audio support
  const handleTranslate = useCallback(async () => {
    // Prevent duplicate calls
    if (!state.audioRecorder.audioBlob || state.isTranslating || isProcessingRef.current) {
      if (isProcessingRef.current) {
        console.log('⏭️ Skipping translation - already processing');
      }
      return;
    }

    // Check if we've already processed this exact blob
    if (state.audioRecorder.audioBlob === lastProcessedBlobRef.current) {
      console.log('⏭️ Skipping translation - blob already processed');
      return;
    }

    // Require authentication for all translations (OpenAI only)
    if (!user) {
      console.log('🚫 User not authenticated - showing signup wall');
      setShowSignupWall(true);
      dispatch({
        type: 'SET_TRANSLATION_ERROR',
        payload: 'Please sign in to use translations. Get started with 50 free translations!'
      });
      return;
    }

    // Mark this blob as being processed
    lastProcessedBlobRef.current = state.audioRecorder.audioBlob;
    console.log('🆕 New audio blob detected, processing with chunked system...');

    // Increment request ID counter for tracking
    const requestId = ++requestIdCounterRef.current;
    const overallStart = Date.now();
    console.log(`🚀 [FRONTEND] Starting chunked translation request #${requestId}...`);
    console.log(`   - Source lang: ${state.sourceLanguage}`);
    console.log(`   - Target lang: ${state.targetLanguage}`);
    console.log(`   - Audio size: ${state.audioRecorder.audioBlob.size} bytes`);

    try {
      isProcessingRef.current = true;
      setIsProcessing(true);
      setProgress(0);
      dispatch({ type: 'START_TRANSLATION' });

      // Clean up old audio URL before creating new one
      if (state.audioRecorder.audioUrl && state.audioRecorder.audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(state.audioRecorder.audioUrl);
        console.log('🧹 Cleaned up old recording audio URL');
      }

      // Determine if we need chunked processing
      const audioSize = state.audioRecorder.audioBlob.size;
      const isLargeAudio = audioSize > 5 * 1024 * 1024; // 5MB threshold
      
      let result;
      let transcriptionText = '';
      
      if (isLargeAudio) {
        // Use chunked processing for large audio files
        console.log('📦 Using chunked processing for large audio file');
        
        // For now, we'll simulate chunking by treating the single blob as one chunk
        // In a real implementation, you might split the blob based on duration
        result = await processChunkedAudio(
          [state.audioRecorder.audioBlob],
          state.sourceLanguage,
          state.targetLanguage,
          state.selectedTone,
          (progress, stage) => {
            setProgress(progress);
            setProcessingStage(stage);
          }
        );
      } else {
        // Use traditional single-file processing for smaller files
        console.log('📄 Using traditional processing for standard audio file');
        
        // Step 1: Transcribe audio
        setProcessingStage('Transcribing audio...');
        setProgress(33);
        
        const audioFile = new File(
          [state.audioRecorder.audioBlob],
          `recording-${Date.now()}.webm`,
          { type: state.audioRecorder.audioBlob.type }
        );
        
        const transcriptionResult = await transcribeAudio(
          audioFile,
          state.sourceLanguage
        );
        
        transcriptionText = transcriptionResult.transcription;

        // Step 1.5: Validate language detection (warn but don't block)
        setProcessingStage('Validating language...');
        setProgress(35);

        const languageValidation = enhancedLanguageDetection(
          transcriptionText,
          state.sourceLanguage
        );

        // Show warning but continue with translation
        if (!languageValidation.isValid && languageValidation.detectedLanguage) {
          const warningMessage = `⚠️ Language mismatch: Expected ${getLanguageName(state.sourceLanguage)} but detected ${getLanguageName(languageValidation.detectedLanguage)}. Continuing with translation...`;
          setLanguageValidationError(warningMessage);
          console.warn(warningMessage);
        } else {
          // Clear any previous language validation errors
          setLanguageValidationError('');
        }

        // Step 1.6: Enhance the original text (improve grammar/clarity in same language)
        setProcessingStage('Enhancing original text...');
        setProgress(50);

        const { translateText } = await import('../services/api');

        // Check if user is trying to use OpenAI without authentication
        if (state.translationProvider === 'openai' && !user) {
          throw new Error('Authentication required for premium OpenAI translations. Please sign in or switch to the free NLLB model.');
        }

        const enhancementResult = await translateText(
          transcriptionText,
          state.sourceLanguage,
          state.sourceLanguage, // Same language = enhancement
          state.selectedTone,
          userTier,
          state.translationProvider
        );

        // Step 2: Translate text
        setProcessingStage('Translating text...');
        setProgress(75);

        // Use bidirectional translation
        const translationResult = await translateBidirectional({
          text: enhancementResult.translation, // Use enhanced version for translation
          direction: state.translationDirection,
          language: state.translationDirection === 'to-english' ? state.sourceLanguage : state.targetLanguage,
          tone: state.selectedTone,
          userTier,
          provider: state.translationProvider
        });
        
        // Update filter status if available
        if (translationResult.wasFiltered !== undefined) {
          setFilterStatus({
            wasFiltered: translationResult.wasFiltered || false,
            detectedIssues: translationResult.detectedIssues || [],
            severityLevel: translationResult.severityLevel || 'none'
          });
        }
        
        result = {
          transcription: transcriptionResult.transcription,
          translation: enhancementResult.translation, // Enhanced version (same language)
          actualTranslation: translationResult.translation, // Actual translation (different language)
          chunks: [transcriptionResult.transcription]
        };
      }
      
      setProcessingStage('Finalizing...');
      setProgress(90);

      // Create translation history item
      const translationItem = {
        id: Date.now().toString(),
        originalText: result.transcription,
        translatedText: result.actualTranslation || result.translation, // Use actual translation if available
        enhancedText: result.translation, // Store enhanced version separately
        sourceLanguage: state.translationDirection === 'to-english' ? state.sourceLanguage : 'en',
        targetLanguage: state.translationDirection === 'to-english' ? 'en' : state.targetLanguage,
        tone: state.selectedTone,
        timestamp: new Date(),
      };

      dispatch({ type: 'SET_TRANSLATION', payload: translationItem });
      dispatch({ type: 'ADD_TO_HISTORY', payload: { item: translationItem, userId: user?.id } });

      // Refresh usage quota after successful translation
      if ((window as any).refreshUsageQuota) {
        (window as any).refreshUsageQuota();
      }

      const totalDuration = Date.now() - overallStart;
      
      // Update performance metrics
      const metrics = {
        transcriptionTime: totalDuration * 0.6, // Approximate
        translationTime: totalDuration * 0.3,   // Approximate
        totalTime: totalDuration,
      };
      setPerformanceMetrics(metrics);
      
      console.log('⏱️ Enhanced Processing Metrics:');
      console.log(`   Chunks processed: ${result.chunks.length}`);
      console.log(`   Total characters: ${result.transcription.length}`);
      console.log(`   Total time: ${(totalDuration/1000).toFixed(2)}s`);
      console.log(`✅ [FRONTEND] Chunked translation request #${requestId} completed in ${totalDuration}ms`);
      
      setProgress(100);
      setProcessingStage('Complete!');
      
      // Clear progress after a short delay
      setTimeout(() => {
        setProcessingStage('');
        setProgress(0);
      }, 1500);

    } catch (error) {
      const totalDuration = Date.now() - overallStart;
      console.error(`❌ [FRONTEND] Chunked translation request #${requestId} failed after ${totalDuration}ms:`, error);
      
      setProcessingStage('');
      setProgress(0);
      
      dispatch({
        type: 'SET_TRANSLATION_ERROR',
        payload: error instanceof Error ? error.message : 'Translation failed. Please try speaking more slowly or in shorter segments.'
      });
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [state.audioRecorder.audioBlob, state.audioRecorder.audioUrl, state.sourceLanguage, state.targetLanguage, state.selectedTone, state.isTranslating, state.translationDirection, state.translationProvider, userTier, user, dispatch]);

  // Clear anonymous usage when user signs in
  useEffect(() => {
    if (user) {
      clearAnonymousUsage();
      console.log('✅ User authenticated - cleared anonymous usage tracking');
    }
  }, [user]);

  // Trigger translation when audio is recorded
  useEffect(() => {
    // Only process if we have a blob and it's different from the last one we processed
    if (state.audioRecorder.audioBlob &&
        state.audioRecorder.audioBlob !== lastProcessedBlobRef.current &&
        !state.isTranslating &&
        !isProcessingRef.current) {
      console.log('🎯 useEffect triggered: New audio blob detected');
      handleTranslate();
    }
  }, [state.audioRecorder.audioBlob, state.isTranslating, handleTranslate]);

  // Analyze text with WASM when translation is complete
  useEffect(() => {
    const analyzeTexts = async () => {
      if (state.currentTranslation && isWasmReady) {
        console.log('🦀 Running WASM text analysis...');
        try {
          // Analyze original text
          const origAnalysis = await analyzeText(state.currentTranslation.originalText);
          if (origAnalysis) {
            setOriginalAnalysis(origAnalysis);
            console.log('✅ Original text analyzed:', origAnalysis);
          }

          // Analyze translated text
          const transAnalysis = await analyzeText(state.currentTranslation.translatedText);
          if (transAnalysis) {
            setTranslatedAnalysis(transAnalysis);
            console.log('✅ Translated text analyzed:', transAnalysis);
          }
        } catch (error) {
          console.error('❌ WASM analysis failed:', error);
        }
      }
    };

    analyzeTexts();
  }, [state.currentTranslation, isWasmReady, analyzeText]);

  const handleCopyOriginal = async () => {
    if (state.currentTranslation) {
      const success = await copyToClipboard(state.currentTranslation.originalText);
      if (success) {
        // You could add a toast notification here
        console.log('Copied to clipboard');
      }
    }
  };

  const handleCopyTranslation = async () => {
    if (state.currentTranslation) {
      const success = await copyToClipboard(state.currentTranslation.translatedText);
      if (success) {
        // You could add a toast notification here
        console.log('Copied to clipboard');
      }
    }
  };

  // Timestamp formatting utility
  // const formatTimestamp = (date: Date) => {
  //   return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  // };

  // Handle language switch suggestion
  const handleLanguageSwitch = (newLanguage: string) => {
    dispatch({ type: 'SET_SOURCE_LANGUAGE', payload: newLanguage });
    setLanguageValidationError('');
    dispatch({ type: 'CLEAR_TRANSLATION_ERROR' });
  };

  return (
    <div className="space-y-6">
      {/* TEMPORARILY DISABLED - Continuous recording feature needs more work */}

      {/* Translation Direction Toggle */}
      <TranslationDirectionToggle />

      {/* Source Language Selector (only when translating to English) */}
      <SourceLanguageSelector />

      {/* Target Language Selector (only when translating from English) */}
      <TargetLanguageSelector />

      {/* Translation Provider Toggle */}
      <TranslationProviderToggle
        provider={state.translationProvider}
        onChange={(provider) => dispatch({ type: 'SET_TRANSLATION_PROVIDER', payload: provider })}
        isAuthenticated={!!user}
        onLoginRequired={() => {
          // Show alert for now - can be replaced with a modal
          alert('Please sign in to use premium OpenAI translations. Free NLLB translations are available without signing in!');
        }}
      />

      {/* Usage Counter for anonymous users */}
      <UsageCounter
        isAuthenticated={!!user}
        onSignupClick={() => {
          setShowSignupWall(true);
        }}
      />

      {/* Loading State with Progress */}
      {isProcessing && (
        <div className="loading-indicator py-8">
          <div className="flex items-center justify-center mb-4">
            <LoadingSpinner />
          </div>
          <div className="max-w-md mx-auto">
            <div className="progress-bar bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
              <div 
                className="progress-fill bg-primary-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center font-medium">{processingStage}</p>
            {progress < 50 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                {progress < 30 ? 'First request may take 30-60 seconds (model loading)' : 
                 progress < 60 ? 'Processing audio chunks for better accuracy' :
                 'Finalizing translation and speech synthesis'}
              </p>
            )}
            {performanceMetrics.totalTime > 0 && progress === 100 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Completed in {(performanceMetrics.totalTime/1000).toFixed(1)}s
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Loading State (fallback for state.isTranslating) */}
      {state.isTranslating && !isProcessing && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-3 text-gray-600">Processing translation...</span>
        </div>
      )}

      {/* Error State */}
      {state.translationError && (
        <ErrorDisplay 
          error={state.translationError}
          onDismiss={() => dispatch({ type: 'CLEAR_TRANSLATION_ERROR' })}
        />
      )}

      {/* Translation Results */}
      {state.currentTranslation && !state.isTranslating && (
        <div className="space-y-4">
          {/* Content Filter Status */}
          <FilterStatusNotification
            wasFiltered={filterStatus.wasFiltered}
            detectedIssues={filterStatus.detectedIssues}
            severityLevel={filterStatus.severityLevel}
            showUpgradePrompt={true}
          />

          {/* Language Detection Indicator */}
          {state.currentTranslation && (
            <LanguageDetectionIndicator
              text={state.currentTranslation.originalText}
              expectedLanguage={state.sourceLanguage}
              onLanguageSwitch={handleLanguageSwitch}
              className="mb-4"
            />
          )}

          {/* Side-by-side layout for Original and Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Raw Original Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-blue-900">
                Original Speech ({state.currentTranslation.sourceLanguage.toUpperCase()})
              </h3>
              <div className="flex items-center space-x-2">
                <EnhancedTextToSpeechPanel
                  initialText={state.currentTranslation.originalText}
                  initialLanguage={state.currentTranslation.sourceLanguage}
                  compact={true}
                />
                <button
                  onClick={handleCopyOriginal}
                  className="flex items-center space-x-1 px-2 py-1 text-blue-600 hover:text-blue-800 text-sm"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
            <p className="text-blue-800">{state.currentTranslation.originalText}</p>
            
            {/* WASM Analysis for Original Text */}
            {originalAnalysis && isWasmReady && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">WASM Analysis</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                  <div>
                    <span className="font-medium">Words:</span> {originalAnalysis.word_count}
                  </div>
                  <div>
                    <span className="font-medium">Characters:</span> {originalAnalysis.char_count}
                  </div>
                  <div>
                    <span className="font-medium">Sentences:</span> {originalAnalysis.sentence_count}
                  </div>
                  <div>
                    <span className="font-medium">Read time:</span> {originalAnalysis.reading_time_minutes.toFixed(1)}m
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Detected:</span> {originalAnalysis.detected_language} 
                    <span className="ml-1">({(originalAnalysis.language_confidence * 100).toFixed(0)}% confidence)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Text */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-green-900">
                Enhanced Version ({state.currentTranslation.sourceLanguage.toUpperCase()})
              </h3>
              <div className="flex items-center space-x-2">
                <EnhancedTextToSpeechPanel
                  initialText={state.currentTranslation.enhancedText || state.currentTranslation.translatedText}
                  initialLanguage={state.currentTranslation.sourceLanguage}
                  compact={true}
                />
                <button
                  onClick={() => copyToClipboard(state.currentTranslation?.enhancedText || state.currentTranslation?.translatedText || '')}
                  className="flex items-center space-x-1 px-2 py-1 text-green-600 hover:text-green-800 text-sm"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
            <p className="text-green-800">{state.currentTranslation.enhancedText || state.currentTranslation.translatedText}</p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Hash className="h-3 w-3" />
                <span>{state.currentTranslation.translatedText.length} characters</span>
              </div>
            </div>
            
            {/* WASM Analysis for Translated Text */}
            {translatedAnalysis && isWasmReady && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Cpu className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">WASM Analysis</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                  <div>
                    <span className="font-medium">Words:</span> {translatedAnalysis.word_count}
                  </div>
                  <div>
                    <span className="font-medium">Characters:</span> {translatedAnalysis.char_count}
                  </div>
                  <div>
                    <span className="font-medium">Sentences:</span> {translatedAnalysis.sentence_count}
                  </div>
                  <div>
                    <span className="font-medium">Read time:</span> {translatedAnalysis.reading_time_minutes.toFixed(1)}m
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Detected:</span> {translatedAnalysis.detected_language}
                    <span className="ml-1">({(translatedAnalysis.language_confidence * 100).toFixed(0)}% confidence)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Actual Translation (if different from enhanced) */}
          {state.currentTranslation.enhancedText && state.currentTranslation.enhancedText !== state.currentTranslation.translatedText && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-purple-900">
                  Translation ({state.currentTranslation.targetLanguage.toUpperCase()})
                </h3>
                <div className="flex items-center space-x-2">
                  <EnhancedTextToSpeechPanel
                    initialText={state.currentTranslation.translatedText}
                    initialLanguage={state.currentTranslation.targetLanguage}
                    compact={true}
                  />
                  <button
                    onClick={handleCopyTranslation}
                    className="flex items-center space-x-1 px-2 py-1 text-purple-600 hover:text-purple-800 text-sm"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
              <p className="text-purple-800">{state.currentTranslation.translatedText}</p>
            </div>
          )}

          {/* Competence Meter - Shows professionalism improvement */}
          <CompetenceMeter
            inputText={state.currentTranslation.originalText}
            outputText={state.currentTranslation.enhancedText || state.currentTranslation.translatedText}
            selectedTone={state.selectedTone}
            showAnimation={true}
          />
        </div>
      )}

      {/* Manual Translate Button */}
      {state.audioRecorder.audioBlob && !state.currentTranslation && !state.isTranslating && !state.translationError && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎤</div>
          <p className="text-lg font-medium mb-4">Audio recorded successfully!</p>
          <p className="text-sm text-gray-600 mb-6">Click to translate your speech</p>
          <button
            onClick={handleTranslate}
            disabled={isProcessing}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all mx-auto ${
              isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'btn-primary hover:shadow-lg'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Translate Audio</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* No Translation State */}
      {!state.audioRecorder.audioBlob && !state.currentTranslation && !state.isTranslating && !state.translationError && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">🎤</div>
          <p className="text-lg font-medium">Record audio to get started</p>
          <p className="text-sm">Your speech will be transcribed and translated</p>
        </div>
      )}

      {/* Signup Wall Modal */}
      <SignupWallModal
        isOpen={showSignupWall}
        onClose={() => setShowSignupWall(false)}
        onSignup={() => {
          setShowSignupWall(false);
          // Trigger Google sign-in
          // The user can click "Sign In" in the header after closing the modal
          alert('Please click "Sign In" in the header to create your free account and get 15 translations per month!');
        }}
      />
    </div>
  );
};

export default TranslationPanel;
