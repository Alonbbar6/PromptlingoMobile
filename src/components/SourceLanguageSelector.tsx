import React from 'react';
import { useTranslation } from '../contexts/TranslationContext';

const SourceLanguageSelector: React.FC = () => {
  const { state, dispatch } = useTranslation();

  const handleSourceLanguageChange = (languageCode: string) => {
    dispatch({ type: 'SET_SOURCE_LANGUAGE', payload: languageCode });
  };

  // Only show this component when translating TO English
  if (state.translationDirection !== 'to-english') {
    return null;
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Source Language (What you're speaking)
      </label>
      <select
        value={state.sourceLanguage}
        onChange={(e) => handleSourceLanguageChange(e.target.value)}
        className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="ht">🇭🇹 Kreyòl Ayisyen (Haitian Creole)</option>
        <option value="es">🇪🇸 Español (Spanish)</option>
      </select>
      <p className="text-xs text-gray-500 mt-1">
        Select the language you'll be speaking (will be translated to English)
      </p>
    </div>
  );
};

export default SourceLanguageSelector;
