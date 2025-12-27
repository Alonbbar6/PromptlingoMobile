import React from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';

// Helper function to get language display name
const getSourceLanguageName = (code: string): string => {
  const languageNames: Record<string, string> = {
    'ht': 'Haitian Creole',
    'es': 'Spanish',
    'en': 'English'
  };
  return languageNames[code] || code;
};

const TranslationDirectionToggle: React.FC = () => {
  const { state, dispatch } = useTranslation();
  const { t } = useLanguage();

  const handleDirectionChange = (direction: 'to-english' | 'from-english') => {
    dispatch({ type: 'SET_TRANSLATION_DIRECTION', payload: direction });
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {t('translator.translationDirection')}
      </label>
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => handleDirectionChange('to-english')}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
            state.translationDirection === 'to-english'
              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <ArrowRight className="h-4 w-4 flex-shrink-0" />
            <div className="text-left">
              <div className="font-semibold text-sm sm:text-base">{t('translator.toEnglish')}</div>
              <div className="text-xs mt-1 text-gray-500 hidden sm:block">
                {t('translator.toEnglishDesc')}
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleDirectionChange('from-english')}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
            state.translationDirection === 'from-english'
              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <ArrowLeft className="h-4 w-4 flex-shrink-0" />
            <div className="text-left">
              <div className="font-semibold text-sm sm:text-base">{t('translator.fromEnglish')}</div>
              <div className="text-xs mt-1 text-gray-500 hidden sm:block">
                {t('translator.fromEnglishDesc')}
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Current direction indicator */}
      <div className="mt-3 text-sm text-gray-600 text-center">
        {state.translationDirection === 'to-english' ? (
          <span>
            {t('translator.currentlyTranslating')
              .replace('{source}', getSourceLanguageName(state.sourceLanguage))
              .replace('{target}', 'English')}
          </span>
        ) : (
          <span>
            {t('translator.currentlyTranslating')
              .replace('{source}', 'English')
              .replace('{target}', getSourceLanguageName(state.targetLanguage))}
          </span>
        )}
      </div>
    </div>
  );
};

export default TranslationDirectionToggle;
