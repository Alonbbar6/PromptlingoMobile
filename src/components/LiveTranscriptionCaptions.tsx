import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, Square, Volume2, Settings } from 'lucide-react';
import { LiveTranscriptionService, TranscriptionChunk } from '../services/liveTranscriptionService';
import { LANGUAGES } from '../contexts/TranslationContext';

interface CaptionLine {
  id: string;
  text: string;
  translatedText?: string;
  timestamp: Date;
  opacity: number;
}

const LiveTranscriptionCaptions: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'error'>('idle');
  const [captions, setCaptions] = useState<CaptionLine[]>([]);
  const [error, setError] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [chunkDuration, setChunkDuration] = useState(3000); // 3 seconds
  const [maxCaptions, setMaxCaptions] = useState(5);

  const serviceRef = useRef<LiveTranscriptionService | null>(null);
  const captionsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest caption
  useEffect(() => {
    if (captionsEndRef.current) {
      captionsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [captions]);

  // Fade out old captions over time
  useEffect(() => {
    const interval = setInterval(() => {
      setCaptions((prev) => {
        const now = Date.now();
        return prev
          .map((caption) => {
            const age = now - caption.timestamp.getTime();
            const fadeStartAge = 5000; // Start fading after 5 seconds
            const fadeEndAge = 10000; // Fully faded at 10 seconds

            if (age > fadeEndAge) {
              return null; // Remove completely
            }

            if (age > fadeStartAge) {
              const fadeProgress = (age - fadeStartAge) / (fadeEndAge - fadeStartAge);
              return {
                ...caption,
                opacity: 1 - fadeProgress,
              };
            }

            return caption;
          })
          .filter((c): c is CaptionLine => c !== null)
          .slice(-maxCaptions); // Keep only last N captions
      });
    }, 100);

    return () => clearInterval(interval);
  }, [maxCaptions]);

  // Handle new transcription chunk
  const handleChunkTranscribed = useCallback((chunk: TranscriptionChunk) => {
    console.log('📝 New caption:', chunk.text);
    if (chunk.translatedText) {
      console.log('🌐 Translation:', chunk.translatedText);
    }

    const newCaption: CaptionLine = {
      id: chunk.id,
      text: chunk.text,
      translatedText: chunk.translatedText,
      timestamp: chunk.timestamp,
      opacity: 1,
    };

    setCaptions((prev) => [...prev, newCaption]);
  }, []);

  // Handle errors
  const handleError = useCallback((err: Error) => {
    console.error('Live transcription error:', err);
    setError(err.message);
    setStatus('error');
  }, []);

  // Handle status change
  const handleStatusChange = useCallback((newStatus: 'idle' | 'recording' | 'processing' | 'error') => {
    setStatus(newStatus);
  }, []);

  // Start live transcription
  const startTranscription = async () => {
    try {
      setError('');
      setCaptions([]);

      // Create service
      const service = new LiveTranscriptionService({
        language: selectedLanguage,
        targetLanguage: targetLanguage || undefined,
        chunkDuration: chunkDuration,
        onChunkTranscribed: handleChunkTranscribed,
        onError: handleError,
        onStatusChange: handleStatusChange,
      });

      serviceRef.current = service;

      // Start recording
      await service.start();
      setIsRecording(true);
    } catch (err) {
      handleError(err as Error);
    }
  };

  // Stop live transcription
  const stopTranscription = async () => {
    if (serviceRef.current) {
      await serviceRef.current.stop();
      serviceRef.current = null;
    }
    setIsRecording(false);
  };

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'recording':
        return 'bg-green-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'recording':
        return 'Recording';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error';
      default:
        return 'Ready';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* Header Controls */}
      <div className="bg-black/50 backdrop-blur-md border-b border-gray-700 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">Live Transcription</h1>

            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${status === 'recording' ? 'animate-pulse' : ''}`} />
              <span className="text-sm text-gray-300">{getStatusText()}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Language Selectors */}
            {!isRecording && (
              <>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">Source Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">Translate To (Optional)</label>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">No Translation</option>
                    {LANGUAGES.filter(lang => lang.code !== selectedLanguage).map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeName}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors shrink-0"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* Start/Stop Button */}
            {!isRecording ? (
              <button
                onClick={startTranscription}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg whitespace-nowrap"
              >
                <Mic className="h-5 w-5" />
                <span>Start Transcription</span>
              </button>
            ) : (
              <button
                onClick={stopTranscription}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-lg whitespace-nowrap"
              >
                <Square className="h-5 w-5" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-white font-semibold mb-3">Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Chunk Duration: {chunkDuration / 1000}s
                </label>
                <input
                  type="range"
                  min="2000"
                  max="5000"
                  step="500"
                  value={chunkDuration}
                  onChange={(e) => setChunkDuration(parseInt(e.target.value))}
                  disabled={isRecording}
                  className="w-full"
                />
                <p className="text-xs text-gray-400 mt-1">
                  How often to send audio for transcription
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Max Captions: {maxCaptions}
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="1"
                  value={maxCaptions}
                  onChange={(e) => setMaxCaptions(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Number of captions to display
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Caption Display Area */}
      <div className="flex-1 flex items-end justify-center p-8 overflow-hidden">
        <div className="w-full max-w-5xl">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-200 text-center">{error}</p>
            </div>
          )}

          {/* Instructions when not recording */}
          {!isRecording && captions.length === 0 && (
            <div className="text-center text-gray-400 mb-8">
              <Volume2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl">Click "Start Transcription" to begin</p>
              <p className="text-sm mt-2">
                Live captions will appear here as people speak
              </p>
            </div>
          )}

          {/* Captions */}
          <div className="space-y-4">
            {captions.map((caption, index) => {
              const isCurrent = index === captions.length - 1;
              const fontSize = isCurrent ? 'text-4xl' : 'text-2xl';
              const fontWeight = isCurrent ? 'font-bold' : 'font-medium';

              return (
                <div
                  key={caption.id}
                  className={`transition-all duration-300 ${fontSize} ${fontWeight}`}
                  style={{
                    opacity: caption.opacity,
                    transform: `translateY(${isCurrent ? '0' : '-10px'})`,
                  }}
                >
                  <div className="bg-black/80 backdrop-blur-sm px-8 py-4 rounded-lg border border-gray-700 shadow-2xl">
                    {/* Original Text */}
                    <p className="text-white text-center leading-relaxed">
                      {caption.text}
                    </p>

                    {/* Translated Text */}
                    {caption.translatedText && (
                      <p className="text-blue-300 text-center leading-relaxed mt-3 pt-3 border-t border-gray-600">
                        {caption.translatedText}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={captionsEndRef} />
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-3 px-6 py-3 bg-red-500/20 border border-red-500 rounded-full">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-200 font-medium">Recording Live</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTranscriptionCaptions;
