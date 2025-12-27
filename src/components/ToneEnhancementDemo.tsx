import React, { useState } from 'react';
import { Wand2, Loader2, Languages, Volume2 } from 'lucide-react';
import { getEnhancedToneService, getAvailableTones, EnhancedToneResult } from '../services/enhancedToneService';

const ToneEnhancementDemo: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [result, setResult] = useState<EnhancedToneResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const toneService = getEnhancedToneService();
  const availableTones = getAvailableTones();

  // Example texts for testing
  const exampleTexts = [
    { language: 'Spanish', text: 'hola como estan', expected: 'Hello. How are you all doing?' },
    { language: 'Haitian Creole', text: 'Kijan ou ye?', expected: 'Hello. How are you?' },
    { language: 'English', text: 'hey whats up', expected: 'Hello. How are you?' }
  ];

  const handleEnhance = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to enhance');
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      console.log('🎭 [DEMO] Starting tone enhancement for:', inputText);
      const enhancedResult = await toneService.enhanceTextWithTone(inputText, selectedTone);
      setResult(enhancedResult);
      console.log('✅ [DEMO] Enhancement completed:', enhancedResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Enhancement failed';
      setError(errorMessage);
      console.error('❌ [DEMO] Enhancement failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadExample = (text: string) => {
    setInputText(text);
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎭 Tone Enhancement Demo</h1>
        <p className="text-gray-600">
          Test the enhanced tone service with automatic translation for non-English text
        </p>
      </div>

      {/* Example Texts */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-3">📝 Try These Examples:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {exampleTexts.map((example, index) => (
            <button
              key={index}
              onClick={() => loadExample(example.text)}
              className="text-left p-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="font-medium text-blue-900">{example.language}</div>
              <div className="text-sm text-blue-700 mb-1">"{example.text}"</div>
              <div className="text-xs text-blue-600">Expected: "{example.expected}"</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input Text (any language)
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text in Spanish, Haitian Creole, or English..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Tone
            </label>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableTones.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.icon} {tone.name} - {tone.description}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleEnhance}
            disabled={!inputText.trim() || isProcessing}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Enhance Text
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700 font-medium">Error</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🎯 Enhancement Results</h3>

          {/* Language Detection */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Languages className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Language Processing</h4>
            </div>
            <div className="text-blue-800 text-sm space-y-1">
              <p>
                <span className="font-medium">Detected Language:</span>{' '}
                <span className="capitalize">{result.detectedLanguage}</span>{' '}
                <span className="text-blue-600">
                  ({(result.languageConfidence * 100).toFixed(1)}% confidence)
                </span>
              </p>
              {result.wasTranslated && (
                <p>
                  <span className="font-medium">Translation:</span>{' '}
                  <span className="text-green-700 font-medium">✓ Translated to English</span>
                </p>
              )}
            </div>
          </div>

          {/* Text Progression */}
          <div className="space-y-4">
            {/* Original Text */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">📝 Original Text</h4>
              <p className="text-gray-800">"{result.originalText}"</p>
            </div>

            {/* Translated Text (if applicable) */}
            {result.translatedText && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">🌐 Translated Text</h4>
                <p className="text-purple-800">"{result.translatedText}"</p>
              </div>
            )}

            {/* Enhanced Text */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">
                  ✨ Enhanced Text ({availableTones.find(t => t.id === selectedTone)?.name})
                </h4>
              </div>
              <p className="text-green-800 text-lg font-medium">"{result.enhancedText}"</p>
            </div>
          </div>

          {/* Transformations Applied */}
          {result.transformationsApplied.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-3">🔧 Transformations Applied</h4>
              <ul className="text-yellow-800 text-sm space-y-1">
                {result.transformationsApplied.map((transformation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>{transformation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Indicator */}
          <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-800">
                ✅ Enhancement completed successfully!
              </span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              The text has been {result.wasTranslated ? 'translated and ' : ''}enhanced with {selectedTone} tone.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToneEnhancementDemo;
