import React from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { History, Trash2, Eye, EyeOff } from 'lucide-react';

const ConversationHistory: React.FC = () => {
  const { state, dispatch } = useTranslation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleClearHistory = () => {
    if (window.confirm(t('history.confirmClear'))) {
      dispatch({ type: 'CLEAR_HISTORY', payload: { userId: user?.id } });
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('history.justNow');
    if (minutes < 60) return t('history.minutesAgo').replace('{count}', String(minutes));
    if (hours < 24) return t('history.hoursAgo').replace('{count}', String(hours));
    if (days < 7) return t('history.daysAgo').replace('{count}', String(days));
    return new Date(date).toLocaleDateString();
  };

  const getLanguageName = (code: string) => {
    return code === 'en' ? 'English' : 'Kreyòl Ayisyen';
  };

  const getToneColor = (tone: string) => {
    const colors = {
      casual: 'bg-blue-100 text-blue-700',
      business: 'bg-green-100 text-green-700',
      formal: 'bg-purple-100 text-purple-700',
      informal: 'bg-orange-100 text-orange-700',
      medical: 'bg-red-100 text-red-700',
    };
    return colors[tone as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="mt-8">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t('history.title')}
            </h2>
            <span className="text-sm text-gray-500">
              ({t('history.count').replace('{count}', String(state.translationHistory.length))})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_HISTORY' })}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              {state.showHistory ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span>{state.showHistory ? t('history.hide') : t('history.show')}</span>
            </button>

            {state.translationHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4" />
                <span>{t('history.clear')}</span>
              </button>
            )}
          </div>
        </div>

        {state.translationHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">{t('history.noTranslations')}</p>
            <p className="text-xs text-gray-400 mt-1">
              {t('history.historyMessage')}
            </p>
          </div>
        ) : (
          <div className={`space-y-4 transition-all duration-300 ${
            state.showHistory ? 'max-h-96 overflow-y-auto' : 'max-h-0 overflow-hidden'
          }`}>
            {state.translationHistory.filter(item => item !== null && item !== undefined).map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      {getLanguageName(item.sourceLanguage)} → {getLanguageName(item.targetLanguage)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getToneColor(item.tone)}`}>
                      {item.tone}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-900">
                    <span className="font-medium">{t('history.original')}</span> {item.originalText}
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{t('history.translation')}</span> {item.translatedText}
                  </div>
                </div>

                {item.audioUrl && (
                  <div className="mt-2">
                    <audio controls className="w-full h-8">
                      <source src={item.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistory;
