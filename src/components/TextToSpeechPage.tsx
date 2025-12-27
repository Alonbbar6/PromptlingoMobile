import React, { useState } from 'react';
import { Volume2, FileText, Mic, ArrowLeft } from 'lucide-react';
import EnhancedTextToSpeechPanel from './EnhancedTextToSpeechPanel';
import { useTranslation } from '../contexts/TranslationContext';
import { useLanguage } from '../contexts/LanguageContext';

interface TextToSpeechPageProps {
  onBack?: () => void;
}

const TextToSpeechPage: React.FC<TextToSpeechPageProps> = ({ onBack }) => {
  const { state } = useTranslation();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'manual' | 'translation'>('manual');

  const sampleTexts = {
    en: "Hello! This is a sample text to test the text-to-speech functionality. You can adjust the speed and voice settings to customize your experience.",
    es: "¡Hola! Este es un texto de ejemplo para probar la funcionalidad de texto a voz. Puedes ajustar la velocidad y configuración de voz para personalizar tu experiencia.",
    ht: "Bonjou! Sa a se yon tèks egzanp pou teste fonksyon tèks-nan-vwa a. Ou ka ajiste vitès la ak paramèt vwa yo pou ou ka kustomize eksperyans ou an."
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('tts.back')}</span>
            </button>
          )}
          <div className="flex items-center space-x-3">
            <Volume2 className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('tts.title')}</h1>
              <p className="text-gray-600">{t('tts.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'manual'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>{t('tts.manualInput')}</span>
        </button>
        <button
          onClick={() => setActiveTab('translation')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'translation'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mic className="h-4 w-4" />
          <span>{t('tts.fromTranslation')}</span>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'manual' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('tts.enterTextToSpeak')}
            </h2>
            <EnhancedTextToSpeechPanel />

            {/* Sample Texts */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('tts.sampleTexts')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(sampleTexts).map(([lang, text]) => (
                  <div key={lang} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {lang === 'en' ? 'English' : lang === 'es' ? 'Español' : 'Kreyòl Ayisyen'}
                      </span>
                      <EnhancedTextToSpeechPanel
                        initialText={text}
                        initialLanguage={lang}
                        compact={true}
                      />
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'translation' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('tts.speakTranslationResults')}
            </h2>

            {state.currentTranslation ? (
              <div className="space-y-6">
                {/* Original Text */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-blue-900">
                      {t('tts.original')} ({state.currentTranslation.sourceLanguage.toUpperCase()})
                    </h3>
                    <EnhancedTextToSpeechPanel
                      initialText={state.currentTranslation.originalText}
                      initialLanguage={state.currentTranslation.sourceLanguage}
                      compact={true}
                    />
                  </div>
                  <p className="text-blue-800">{state.currentTranslation.originalText}</p>
                </div>

                {/* Translated Text */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-green-900">
                      {t('tts.translation')} ({state.currentTranslation.targetLanguage.toUpperCase()})
                    </h3>
                    <EnhancedTextToSpeechPanel
                      initialText={state.currentTranslation.translatedText}
                      initialLanguage={state.currentTranslation.targetLanguage}
                      compact={true}
                    />
                  </div>
                  <p className="text-green-800">{state.currentTranslation.translatedText}</p>
                </div>

                {/* Full TTS Panel for Translation */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">{t('tts.advancedControls')}</h3>
                  <EnhancedTextToSpeechPanel
                    initialText={state.currentTranslation.translatedText}
                    initialLanguage={state.currentTranslation.targetLanguage}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Volume2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('tts.noTranslationAvailable')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('tts.recordFirstMessage')}
                </p>
                {onBack && (
                  <button
                    onClick={onBack}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Mic className="h-4 w-4" />
                    <span>{t('tts.goToTranslator')}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Features Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">{t('tts.featuresTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">{t('tts.supportedLanguages')}</h4>
            <ul className="space-y-1">
              <li>• English - Multiple voices available</li>
              <li>• Spanish - Native Spanish voices</li>
              <li>• Haitian Creole - French voice models</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">{t('tts.controls')}</h4>
            <ul className="space-y-1">
              <li>• Adjustable speech rate (0.5x - 2x)</li>
              <li>• Voice selection by gender/accent</li>
              <li>• Play, pause, and stop controls</li>
              <li>• Progress tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeechPage;
