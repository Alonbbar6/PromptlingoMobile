import React from 'react';
import { Sparkles, Lock } from 'lucide-react';

interface TranslationProviderToggleProps {
  provider: 'openai' | 'nllb';
  onChange: (provider: 'openai' | 'nllb') => void;
  isAuthenticated?: boolean;
  onLoginRequired?: () => void;
}

const TranslationProviderToggle: React.FC<TranslationProviderToggleProps> = ({
  isAuthenticated = false,
}) => {

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Translation Service</h3>

      <div className="flex flex-col items-center p-4 rounded-lg border-2 border-blue-500 bg-blue-50 shadow-md">
        <div className="flex items-center justify-center w-12 h-12 rounded-full mb-3 bg-blue-500">
          <Sparkles className="h-6 w-6 text-white" />
        </div>

        <span className="text-lg font-semibold mb-1 text-blue-700">
          OpenAI GPT-4o Mini
        </span>

        <span className="text-sm text-gray-600 text-center mb-3">
          Professional-grade translations with tone customization
        </span>

        {!isAuthenticated ? (
          <div className="mt-2 px-3 py-2 bg-amber-100 text-amber-700 text-sm font-semibold rounded flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Sign in to get 50 free translations</span>
          </div>
        ) : (
          <div className="mt-2 px-3 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded">
            ✓ Premium Quality • 5 Tone Options
          </div>
        )}
      </div>

      {/* Info Text */}
      <div className="mt-3 text-xs text-gray-600 text-center">
        {isAuthenticated ? (
          <p>⚡ Using OpenAI's GPT-4o Mini for highest translation quality</p>
        ) : (
          <p className="text-amber-600">🔒 Sign in to get started with 50 free translations</p>
        )}
      </div>
    </div>
  );
};

export default TranslationProviderToggle;
