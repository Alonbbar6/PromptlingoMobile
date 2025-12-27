/**
 * Usage Quota Component
 * Displays user's API usage and subscription tier
 */

import React, { useEffect, useState, useCallback } from 'react';
import { usageService, UsageData } from '../services/usageService';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { Crown, TrendingUp, Calendar, Gift } from 'lucide-react';
import PromotionCodeModal from './PromotionCodeModal';

const UsageQuota: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await usageService.getUsage();
        setUsage(data);
      } catch (err: any) {
        console.error('Usage fetch error:', err);
        setError('Failed to load usage data');
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [user]);

  // Refresh usage after each translation
  const refreshUsage = useCallback(async () => {
    if (!user) return;
    try {
      const data = await usageService.getUsage();
      setUsage(data);
    } catch (err) {
      console.error('Usage refresh error:', err);
    }
  }, [user]);

  // Expose refresh function globally for TranslationPanel to call
  useEffect(() => {
    (window as any).refreshUsageQuota = refreshUsage;
    return () => {
      delete (window as any).refreshUsageQuota;
    };
  }, [user, refreshUsage]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !usage) {
    return null;
  }

  const percentage = usage.limit
    ? Math.min((usage.used / usage.limit) * 100, 100)
    : 0;

  const isNearLimit = usage.remaining !== null && usage.remaining <= 3;
  const isAtLimit = usage.remaining === 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {usage.tier === 'pro' ? (
            <>
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-gray-900">{t('usage.proPlan')}</span>
            </>
          ) : (
            <>
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">{t('usage.freePlan')}</span>
            </>
          )}
        </div>

        {usage.tier === 'free' && (
          <button
            className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm flex items-center space-x-1"
            onClick={() => setShowPromoModal(true)}
          >
            <Gift className="h-3 w-3" />
            <span>{t('user.redeemCode')}</span>
          </button>
        )}
      </div>

      {/* Usage Stats */}
      {usage.unlimited ? (
        <div className="text-center py-2">
          <p className="text-sm text-gray-700 font-medium">
            ✨ {t('usage.unlimited')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {t('usage.unlimitedDesc')}
          </p>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">
                {usage.used} / {usage.limit} {t('usage.translations')}
              </span>
              <span className={`font-semibold ${
                isAtLimit ? 'text-red-600' :
                isNearLimit ? 'text-orange-600' :
                'text-blue-600'
              }`}>
                {usage.remaining} {t('usage.left')}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isAtLimit ? 'bg-red-500' :
                  isNearLimit ? 'bg-orange-500' :
                  'bg-blue-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Reset Date */}
          <div className="flex items-center space-x-1 text-xs text-gray-600 mt-2">
            <Calendar className="h-3 w-3" />
            <span>
              {t('usage.resets')}: {new Date(usage.resetDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          {/* Warning Messages */}
          {isAtLimit && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-2">
              <p className="text-xs text-red-800 font-medium">
                ⚠️ {t('usage.limitReached')}
              </p>
            </div>
          )}

          {isNearLimit && !isAtLimit && (
            <div className="mt-3 bg-orange-50 border border-orange-200 rounded-md p-2">
              <p className="text-xs text-orange-800 font-medium">
                🔔 {t('usage.lowRemaining').replace('{count}', String(usage.remaining))}
              </p>
            </div>
          )}
        </>
      )}

      {/* Promotion Code Modal */}
      <PromotionCodeModal
        isOpen={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        onSuccess={() => {
          setShowPromoModal(false);
          refreshUsage();
        }}
      />
    </div>
  );
};

export default UsageQuota;