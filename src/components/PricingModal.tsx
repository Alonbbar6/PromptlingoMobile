import React, { useState, useEffect } from 'react';
import { X, Check, Crown, Loader } from 'lucide-react';
import { getPricingPlans, createCheckoutSession, PricingPlan } from '../services/stripeService';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPricing();
    }
  }, [isOpen]);

  const loadPricing = async () => {
    try {
      setLoading(true);
      setError(null);
      const pricingPlans = await getPricingPlans();
      setPlans(pricingPlans);
    } catch (err: any) {
      console.error('Failed to load pricing:', err);
      setError('Failed to load pricing plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType: 'essential' | 'monthly' | 'yearly') => {
    try {
      setCheckoutLoading(planType);
      await createCheckoutSession(planType);
      // User will be redirected to Stripe Checkout
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to start checkout');
      setCheckoutLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-sm sm:max-w-md md:max-w-3xl lg:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            <p className="text-gray-600 text-sm mt-1">Select the plan that fits your needs</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-3 text-gray-600">Loading pricing...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadPricing}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {plans.filter(p => p.interval === 'month').map((plan) => {
                const isPopular = plan.id === 'essential';
                const isPro = plan.id.includes('pro');

                return (
                <div
                  key={plan.id}
                  className={`rounded-lg border-2 p-6 relative ${
                    isPopular
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : isPro
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="text-gray-500 ml-2">/{plan.interval}</span>
                    </div>
                    {plan.savings && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        {plan.savings}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.id === 'free' ? (
                    <button
                      disabled
                      className="w-full py-2 px-4 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const planType = plan.id === 'essential' ? 'essential' :
                                        plan.interval === 'year' ? 'yearly' : 'monthly';
                        handleUpgrade(planType);
                      }}
                      disabled={!!checkoutLoading}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        plan.id === 'essential'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg text-white'
                          : plan.id === 'pro-monthly'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                    >
                      {checkoutLoading === (plan.id === 'essential' ? 'essential' : plan.interval === 'year' ? 'yearly' : 'monthly') ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade to {plan.name}
                        </>
                      )}
                    </button>
                  )}
                </div>
              )})}
            </div>
          )}

          {/* Additional info */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              All payments are securely processed by Stripe. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;