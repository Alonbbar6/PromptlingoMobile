import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Volume2, Settings, AlertCircle, Wand2, Eye } from 'lucide-react';
import { getTTSService, TTSState, TTSVoice, isTTSSupported } from '../services/textToSpeech';
import { getEnhancedToneService, getAvailableTones, EnhancedToneResult } from '../services/enhancedToneService';
import { LANGUAGES } from '../contexts/TranslationContext';
import { getLanguageDisplayName, getLanguageConfig } from '../config/languages.config';

interface EnhancedTextToSpeechPanelProps {
  initialText?: string;
  initialLanguage?: string;
  className?: string;
  compact?: boolean;
}

const EnhancedTextToSpeechPanel: React.FC<EnhancedTextToSpeechPanelProps> = ({
  initialText = '',
  initialLanguage = 'en',
  className = '',
  compact = false
}) => {
  const [text, setText] = useState(initialText);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [selectedVoice, setSelectedVoice] = useState<string>('male-1');
  const [rate, setRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string>('professional');
  const [enhancedText, setEnhancedText] = useState<string>('');
  const [toneEnhancementResult, setToneEnhancementResult] = useState<EnhancedToneResult | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  
  const [ttsState, setTTSState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    isSupported: isTTSSupported(),
    progress: 0
  });
  const [availableVoices, setAvailableVoices] = useState<TTSVoice[]>([]);
  const [error, setError] = useState<string>('');

  const ttsService = getTTSService(setTTSState);
  const toneService = getEnhancedToneService();
  const availableTones = getAvailableTones();

  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      const voices = await ttsService.getAvailableVoices();
      setAvailableVoices(voices);
      
      if ((!selectedVoice || selectedVoice === '') && voices.length > 0) {
        const bestVoice = await ttsService.getBestVoiceForLanguage(selectedLanguage);
        if (bestVoice) {
          setSelectedVoice(bestVoice.id);
        } else {
          setSelectedVoice('male-1'); // Fallback to default
        }
      }
    };

    loadVoices();
  }, [selectedLanguage, selectedVoice, ttsService]);

  // Update text when prop changes (only if text is empty or initialText is different)
  useEffect(() => {
    if (initialText && initialText !== text && (!text || text === '')) {
      setText(initialText);
      setEnhancedText('');
      setToneEnhancementResult(null);
      setShowPreview(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

  // Update language when prop changes
  useEffect(() => {
    if (initialLanguage !== selectedLanguage) {
      setSelectedLanguage(initialLanguage);
      setSelectedVoice('male-1'); // Reset to default instead of empty
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLanguage]);

  // Apply tone enhancement with translation to target language
  const applyToneEnhancement = useCallback(async () => {
    if (!text.trim()) {
      setError('Please enter some text to enhance');
      return;
    }

    setIsEnhancing(true);
    setError('');
    
    try {
      console.log(`🎭 Applying tone enhancement with target language: ${selectedLanguage}`);
      const result = await toneService.enhanceTextWithTone(text, selectedTone, selectedLanguage);
      setToneEnhancementResult(result);
      setEnhancedText(result.enhancedText);
      setShowPreview(true);
      console.log('🎭 Tone enhancement applied:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Tone enhancement failed';
      setError(errorMessage);
      console.error('Tone Enhancement Error:', err);
    } finally {
      setIsEnhancing(false);
    }
  }, [text, selectedTone, selectedLanguage, toneService]);

  // Speak with enhanced text using backend ElevenLabs API
  const handleSpeak = useCallback(async () => {
    const textToSpeak = enhancedText || text;
    
    if (!textToSpeak.trim()) {
      setError('Please enter some text to speak');
      return;
    }

    setError('');
    
    try {
      await ttsService.speak(textToSpeak, {
        language: selectedLanguage,
        voiceId: selectedVoice
      });
      console.log('✅ Audio played using ElevenLabs AI via backend');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Speech synthesis failed';
      setError(errorMessage);
      console.error('TTS Error:', err);
    }
  }, [text, enhancedText, selectedLanguage, selectedVoice, ttsService]);

  const handlePause = useCallback(() => {
    ttsService.pause();
  }, [ttsService]);

  const handleResume = useCallback(() => {
    ttsService.resume();
  }, [ttsService]);

  const handleStop = useCallback(() => {
    ttsService.stop();
  }, [ttsService]);

  const getLanguageVoices = useCallback(() => {
    return availableVoices.filter(voice =>
      voice?.language?.startsWith(selectedLanguage) ||
      (selectedLanguage === 'ht' && voice?.language?.startsWith('fr'))
    );
  }, [availableVoices, selectedLanguage]);

  const getRateLabel = (rate: number): string => {
    if (rate <= 0.5) return 'Very Slow';
    if (rate <= 0.8) return 'Slow';
    if (rate <= 1.2) return 'Normal';
    if (rate <= 1.5) return 'Fast';
    return 'Very Fast';
  };

  if (!ttsState.isSupported) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Text-to-Speech Not Supported</span>
        </div>
        <p className="text-red-600 text-sm mt-2">
          Your browser doesn't support the Web Speech API. Please use a modern browser like Chrome, Firefox, or Safari.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {!ttsState.isPlaying ? (
          <button
            onClick={handleSpeak}
            disabled={!text.trim()}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm rounded-md transition-colors"
            title="Play audio"
          >
            <Play className="h-4 w-4" />
            <span>Play</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1">
            {ttsState.isPaused ? (
              <button
                onClick={handleResume}
                className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors"
                title="Resume"
              >
                <Play className="h-4 w-4" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-md transition-colors"
                title="Pause"
              >
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </button>
            )}
            <button
              onClick={handleStop}
              className="flex items-center space-x-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-colors"
              title="Stop"
            >
              <Square className="h-4 w-4" />
              <span>Stop</span>
            </button>
          </div>
        )}
        
        {ttsState.isPlaying && (
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${ttsState.progress * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {Math.round(ttsState.progress * 100)}%
            </span>
          </div>
        )}
      </div>
    );
  }

  // Full version with tone enhancement
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Language Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language
        </label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="input-field"
        >
          {LANGUAGES.map((language) => (
            <option key={language.code} value={language.code}>
              {language.nativeName} ({language.name})
            </option>
          ))}
        </select>
      </div>

      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text to Speak
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter or paste text here..."
          rows={4}
          className="input-field resize-none"
        />
        <div className="text-xs text-gray-500 mt-1">
          {text.length} characters
        </div>
      </div>

      {/* Tone Selection */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-medium text-purple-900 mb-3">🎭 Tone Enhancement</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          {availableTones.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedTone === tone.id
                  ? 'bg-purple-200 text-purple-900 border-2 border-purple-400'
                  : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-100'
              }`}
              title={tone.description}
            >
              <span>{tone.icon}</span>
              <span className="font-medium">{tone.name.split('/')[0]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={applyToneEnhancement}
            disabled={!text.trim() || isEnhancing}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            {isEnhancing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            <span>{isEnhancing ? 'Enhancing...' : 'Apply Tone'}</span>
          </button>
          {toneEnhancementResult && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
            </button>
          )}
        </div>
      </div>

      {/* Tone Preview */}
      {showPreview && toneEnhancementResult && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Tone Enhancement Preview</h3>
          
          {/* Language Detection Info */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Language Processing</h4>
            <div className="text-blue-800 text-sm space-y-1">
              <p>• Detected Language: <span className="font-medium capitalize">{toneEnhancementResult.detectedLanguage}</span> 
                ({(toneEnhancementResult.languageConfidence * 100).toFixed(1)}% confidence)</p>
              <p>• Target Language: <span className="font-medium text-purple-700">{getLanguageDisplayName(toneEnhancementResult.targetLanguage)}</span></p>
              {toneEnhancementResult.wasTranslated && (
                <p>• Translation: <span className="font-medium text-green-700">✓ Translated to {getLanguageConfig(toneEnhancementResult.targetLanguage)?.nativeName || toneEnhancementResult.targetLanguage}</span></p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-2">Original Text</h4>
              <p className="text-blue-800 text-sm">{toneEnhancementResult.originalText}</p>
            </div>
            
            {toneEnhancementResult.translatedText && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h4 className="font-medium text-purple-900 mb-2">Translated Text</h4>
                <p className="text-purple-800 text-sm">{toneEnhancementResult.translatedText}</p>
              </div>
            )}
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-medium text-green-900 mb-2">
                Enhanced Text ({availableTones.find(t => t.id === selectedTone)?.name})
              </h4>
              <p className="text-green-800 text-sm">{toneEnhancementResult.enhancedText}</p>
            </div>
          </div>
          
          {toneEnhancementResult.transformationsApplied.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Transformations Applied:</h4>
              <ul className="text-yellow-800 text-sm space-y-1">
                {toneEnhancementResult.transformationsApplied.map((transformation: string, index: number) => (
                  <li key={index}>• {transformation}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Audio Quality Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Volume2 className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">🔊 Premium Audio Quality</h3>
            <p className="text-sm text-blue-700">
              Using ElevenLabs AI voices for high-quality speech synthesis
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {!ttsState.isPlaying ? (
            <button
              onClick={handleSpeak}
              disabled={!text.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            >
              <Play className="h-5 w-5" />
              <span>Speak {enhancedText ? '(Enhanced)' : ''}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              {ttsState.isPaused ? (
                <button
                  onClick={handleResume}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <Play className="h-5 w-5" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                >
                  <Pause className="h-5 w-5" />
                  <span>Pause</span>
                </button>
              )}
              <button
                onClick={handleStop}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <Square className="h-5 w-5" />
                <span>Stop</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* Progress Bar */}
      {ttsState.isPlaying && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Playing {enhancedText ? '(Enhanced Text)' : '(Original Text)'}...</span>
            <span>{Math.round(ttsState.progress * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${ttsState.progress * 100}%` }}
            />
          </div>
        </div>
      )}


      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Speech Settings</h4>
          
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice
            </label>
            <select
              value={selectedVoice || 'male-1'}
              onChange={(e) => setSelectedVoice(e.target.value || 'male-1')}
              className="input-field"
            >
              {getLanguageVoices().map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} {voice.gender && `(${voice.gender})`}
                </option>
              ))}
            </select>
          </div>

          {/* Speech Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speech Rate: {getRateLabel(rate)} ({rate.toFixed(1)}x)
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Voice Information */}
      {selectedLanguage === 'ht' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-blue-700">
            <Volume2 className="h-4 w-4" />
            <span className="font-medium">Haitian Creole TTS</span>
          </div>
          <p className="text-blue-600 text-sm mt-1">
            Using French voice models for Haitian Creole text. The pronunciation may not be perfect but should be understandable.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedTextToSpeechPanel;
