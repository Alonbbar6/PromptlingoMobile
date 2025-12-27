import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  Crown,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Gift,
  Loader,
} from 'lucide-react';
import {
  getSubscriptionStatus,
  createBillingPortalSession,
  SubscriptionStatus,
} from '../services/stripeService';
import PricingModal from '../components/PricingModal';
import PromotionCodeModal from '../components/PromotionCodeModal';
import { promotionService } from '../services/promotionService';

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [activePromotion, setActivePromotion] = useState<any>(null);
  const [managingBilling, setManagingBilling] = useState(false);

  const loadSubscriptionData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [subStatus, promoStatus] = await Promise.all([
        getSubscriptionStatus(),
        promotionService.checkActivePromotion(),
      ]);

      setSubscription(subStatus);
      if (promoStatus.hasActivePromotion) {
        setActivePromotion(promoStatus.promotion);
      }
    } catch (err: any) {
      console.error('Failed to load subscription data:', err);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  const handleManageBilling = async () => {
    try {
      setManagingBilling(true);
      await createBillingPortalSession();
    } catch (err: any) {
      alert(err.message || 'Failed to open billing portal');
    } finally {
      setManagingBilling(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please sign in to view your subscription</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Unable to load subscription</p>
          <p className="text-gray-600 mb-4">{error || 'Please try again later'}</p>
          <button
            onClick={loadSubscriptionData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tier = subscription.subscription_tier || 'free';
  const status = subscription.subscription_status || 'inactive';
  const isPro = tier === 'pro';
  const isEssential = tier === 'essential';
  const isFree = tier === 'free';
  const hasActiveSubscription = status === 'active';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage your PromptLingo subscription and billing</p>
        </div>

        {/* Active Promotion Banner */}
        {activePromotion && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Gift className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 mb-1">
                  Active Promotion: {activePromotion.code}
                </h3>
                <p className="text-sm text-purple-800 mb-2">
                  {activePromotion.description}
                </p>
                <p className="text-xs text-purple-700">
                  Expires: {new Date(activePromotion.expires_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Plan Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  isPro ? 'bg-purple-100' : isEssential ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Crown className={`h-6 w-6 ${
                    isPro ? 'text-purple-600' : isEssential ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isPro ? 'Professional' : isEssential ? 'Essential' : 'Free'} Plan
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {hasActiveSubscription ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Active</span>
                      </>
                    ) : (
                      <>
                        <div className="h-4 w-4 rounded-full bg-gray-400"></div>
                        <span className="text-sm text-gray-600">{status}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isFree ? (
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm"
                >
                  Upgrade Plan
                </button>
              ) : (
                <button
                  onClick={handleManageBilling}
                  disabled={managingBilling}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {managingBilling ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>Manage Billing</span>
                      <ExternalLink className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Plan Features */}
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Plan Features</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {isFree && (
                    <>
                      <li>✓ 15 translations per month</li>
                      <li>✓ All voice options</li>
                      <li>✓ Translation history</li>
                      <li>✓ Standard support</li>
                    </>
                  )}
                  {isEssential && (
                    <>
                      <li>✓ 200 translations per month</li>
                      <li>✓ All voice options</li>
                      <li>✓ Translation history</li>
                      <li>✓ Priority processing</li>
                      <li>✓ Email support</li>
                    </>
                  )}
                  {isPro && (
                    <>
                      <li>✓ Unlimited translations</li>
                      <li>✓ Premium AI voices (ElevenLabs)</li>
                      <li>✓ Advanced features</li>
                      <li>✓ Priority support</li>
                      <li>✓ Custom templates</li>
                    </>
                  )}
                </ul>
              </div>

              {hasActiveSubscription && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Subscription Details</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {subscription.subscription_start_date && (
                      <li className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          Started: {new Date(subscription.subscription_start_date).toLocaleDateString()}
                        </span>
                      </li>
                    )}
                    {subscription.subscription_end_date && (
                      <li className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {subscription.subscription_cancel_at_period_end ? 'Ends' : 'Renews'}: {' '}
                          {new Date(subscription.subscription_end_date).toLocaleDateString()}
                        </span>
                      </li>
                    )}
                  </ul>

                  {subscription.subscription_cancel_at_period_end && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Your subscription will be canceled at the end of the billing period.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Redeem Promotion Code */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gift className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Promotion Codes</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Have a promotion code? Redeem it here for special offers and unlimited access.
            </p>
            <button
              onClick={() => setShowPromoModal(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              Redeem Code
            </button>
          </div>

          {/* Billing Portal */}
          {hasActiveSubscription && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Billing & Invoices</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                View your billing history, update payment methods, and manage your subscription.
              </p>
              <button
                onClick={handleManageBilling}
                disabled={managingBilling}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {managingBilling ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Manage Billing</span>
                    <ExternalLink className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />

      <PromotionCodeModal
        isOpen={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        onSuccess={() => {
          setShowPromoModal(false);
          loadSubscriptionData();
        }}
      />
    </div>
  );
};

export default SubscriptionPage;
