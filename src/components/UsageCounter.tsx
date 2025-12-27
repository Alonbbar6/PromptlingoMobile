import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getRemainingTranslations,
  getTimeUntilReset,
  ANONYMOUS_FREE_LIMIT
} from '../services/anonymousUsageService';

interface UsageCounterProps {
  isAuthenticated: boolean;
  onSignupClick?: () => void;
}

const UsageCounter: React.FC<UsageCounterProps> = ({
  isAuthenticated,
  onSignupClick
}) => {
  const { t } = useLanguage();
  const [remaining, setRemaining] = useState<number>(ANONYMOUS_FREE_LIMIT);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('24 hours');

  const refreshUsage = () => {
    const remainingCount = getRemainingTranslations();
    const resetTime = getTimeUntilReset();
    setRemaining(remainingCount);
    setTimeUntilReset(resetTime);
  };

  useEffect(() => {
    // Only show for unauthenticated users
    if (!isAuthenticated) {
      refreshUsage();

      // Refresh every minute
      const interval = setInterval(refreshUsage, 60000);

      // Expose refresh function globally so TranslationPanel can call it
      (window as any).refreshUsageQuota = refreshUsage;

      return () => {
        clearInterval(interval);
        delete (window as any).refreshUsageQuota;
      };
    }
  }, [isAuthenticated]);

  // Don't show for authenticated users
  if (isAuthenticated) {
    return null;
  }

  const percentUsed = ((ANONYMOUS_FREE_LIMIT - remaining) / ANONYMOUS_FREE_LIMIT) * 100;
  const isLow = remaining <= 3;
  const isEmpty = remaining === 0;

  return (
    <div className={`rounded-lg border-2 p-4 ${
      isEmpty
        ? 'bg-red-50 border-red-300'
        : isLow
        ? 'bg-yellow-50 border-yellow-300'
        : 'bg-blue-50 border-blue-300'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <TrendingUp className={`h-5 w-5 ${
            isEmpty ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-blue-600'
          }`} />
          <h3 className={`font-semibold ${
            isEmpty ? 'text-red-900' : isLow ? 'text-yellow-900' : 'text-blue-900'
          }`}>
            {t('translator.freeTranslations')}
          </h3>
        </div>
        <div className="flex items-center space-x-1 text-sm">
          <Clock className={`h-4 w-4 ${
            isEmpty ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-blue-600'
          }`} />
          <span className={`${
            isEmpty ? 'text-red-700' : isLow ? 'text-yellow-700' : 'text-blue-700'
          }`}>
            {t('translator.resetsIn').replace('{hours}', timeUntilReset)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-medium ${
            isEmpty ? 'text-red-800' : isLow ? 'text-yellow-800' : 'text-blue-800'
          }`}>
            {t('translator.remaining').replace('{used}', String(remaining)).replace('{total}', String(ANONYMOUS_FREE_LIMIT))}
          </span>
          <span className={`text-xs ${
            isEmpty ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-blue-600'
          }`}>
            {t('translator.percentUsed').replace('{percent}', percentUsed.toFixed(0))}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isEmpty
                ? 'bg-red-500'
                : isLow
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            }`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Message based on usage */}
      {isEmpty ? (
        <div className="space-y-2">
          <p className="text-sm text-red-800 font-medium">
            You've used all your free translations for today!
          </p>
          <button
            onClick={onSignupClick}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Sign up for 15 free translations/month →
          </button>
        </div>
      ) : isLow ? (
        <div className="space-y-2">
          <p className="text-sm text-yellow-800">
            Running low! Sign up to get 15 translations per month.
          </p>
          <button
            onClick={onSignupClick}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Get more translations →
          </button>
        </div>
      ) : (
        <p className="text-sm text-blue-700">
          {t('translator.signupPrompt')}
        </p>
      )}
    </div>
  );
};

export default UsageCounter;
