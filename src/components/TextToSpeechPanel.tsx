import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Volume2, Settings, AlertCircle, Wand2, Eye } from 'lucide-react';
import { getTTSService, TTSState, TTSVoice, isTTSSupported } from '../services/textToSpeech';
import { getEnhancedToneService, getAvailableTones, EnhancedToneResult } from '../services/enhancedToneService';
import { LANGUAGES } from '../contexts/TranslationContext';

interface TextToSpeechPanelProps {
  initialText?: string;
  initialLanguage?: string;
  className?: string;
  compact?: boolean; // For inline use in translation results
}

const TextToSpeechPanel: React.FC<TextToSpeechPanelProps> = ({
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
  const [ttsState, setTTSState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    isSupported: isTTSSupported(),
    progress: 0
  });
  const [availableVoices, setAvailableVoices] = useState<TTSVoice[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('professional');
  const [enhancedText, setEnhancedText] = useState<string>('');
  const [toneEnhancementResult, setToneEnhancementResult] = useState<EnhancedToneResult | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);

  const ttsService = getTTSService(setTTSState);
  const toneService = getEnhancedToneService();
  const availableTones = getAvailableTones();

  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      const voices = await ttsService.getAvailableVoices();
      setAvailableVoices(voices);
      
      // Auto-select best voice for current language
      if (!selectedVoice && voices.length > 0) {
        const bestVoice = await ttsService.getBestVoiceForLanguage(selectedLanguage);
        if (bestVoice) {
          setSelectedVoice(bestVoice.id);
        }
      }
    };

    loadVoices();
  }, [selectedLanguage, selectedVoice, ttsService]);

  // Update text when prop changes (only if text is empty or initialText is different)
  useEffect(() => {
    if (initialText && initialText !== text && (!text || text === '')) {
      setText(initialText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

  // Update language when prop changes
  useEffect(() => {
    if (initialLanguage !== selectedLanguage) {
      setSelectedLanguage(initialLanguage);
      // Reset voice selection for new language
      setSelectedVoice('');
    }
  }, [initialLanguage]);

  // Apply tone enhancement to text
  const applyToneEnhancement = useCallback(async () => {
    if (!text.trim()) {
      setError('Please enter some text to enhance');
      return;
    }

    setIsEnhancing(true);
    setError('');
    
    try {
      const result = await toneService.enhanceTextWithTone(text, selectedTone);
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
  }, [text, selectedTone, toneService]);

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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Speech synthesis failed';
      setError(errorMessage);
      console.error('TTS Error:', err);
    }
  }, [text, enhancedText, selectedLanguage, selectedVoice, rate, ttsService]);

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
      voice.language.startsWith(selectedLanguage) ||
      (selectedLanguage === 'ht' && voice.language.startsWith('fr')) // French for Haitian Creole
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
    // Compact version for inline use
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

  // Full version for dedicated TTS page
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
              <span>Speak</span>
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

        <button onClick={() => setShowSettings(!showSettings)} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"><Settings className="h-4 w-4" /><span>Settings</span></button>

      </div>

      {/* Progress Bar */}
      {ttsState.isPlaying && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Playing...</span>
            <span>{Math.round(ttsState.progress * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${ttsState.progress * 100}%` }}
           ></div>  {/* Changed from self-closing to explicit close */}
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
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
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

export default TextToSpeechPanel;
