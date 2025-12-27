import React from 'react';
import { useTranslation } from '../contexts/TranslationContext';

const TargetLanguageSelector: React.FC = () => {
  const { state, dispatch } = useTranslation();

  const handleTargetLanguageChange = (languageCode: string) => {
    dispatch({ type: 'SET_TARGET_LANGUAGE', payload: languageCode });
  };

  // Only show this component when translating FROM English
  if (state.translationDirection !== 'from-english') {
    return null;
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Target Language
      </label>
      <select
        value={state.targetLanguage}
        onChange={(e) => handleTargetLanguageChange(e.target.value)}
        className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="ht">🇭🇹 Kreyòl Ayisyen (Haitian Creole)</option>
        <option value="es">🇪🇸 Español (Spanish)</option>
      </select>
      <p className="text-xs text-gray-500 mt-1">
        Select the language you want to translate English text into
      </p>
    </div>
  );
};

export default TargetLanguageSelector;
