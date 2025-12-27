import React from 'react';
import { X, Check, Clock, Zap, Shield, TrendingUp } from 'lucide-react';
import { getTimeUntilReset } from '../services/anonymousUsageService';

interface SignupWallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: () => void;
}

const SignupWallModal: React.FC<SignupWallModalProps> = ({
  isOpen,
  onClose,
  onSignup
}) => {
  if (!isOpen) return null;

  const resetTime = getTimeUntilReset();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Close button - larger touch target on mobile */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 p-3 sm:p-2 text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-100 rounded-full transition-colors z-10 shadow-md"
          aria-label="Close"
        >
          <X className="h-6 w-6 sm:h-5 sm:w-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 md:p-8 text-white">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="p-3 sm:p-4 bg-white bg-opacity-20 rounded-full">
              <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2">
            You've Used Your Free Translations!
          </h2>
          <p className="text-center text-blue-100 text-sm sm:text-base md:text-lg">
            Sign up for free to get more translations and unlock premium features
          </p>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6 md:p-8">
          {/* Reset Timer */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2 sm:space-x-3">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-yellow-800">
              <strong>Free translations reset in {resetTime}</strong> - or sign up now for more!
            </p>
          </div>

          {/* Comparison Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
            {/* Free Tier */}
            <div className="border-2 border-gray-200 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 sm:mb-3 text-center">
                Anonymous
              </h3>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">10 translations/day</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Free NLLB model only</span>
                </div>
                <div className="flex items-start space-x-2">
                  <X className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400 line-through">Translation history</span>
                </div>
                <div className="flex items-start space-x-2">
                  <X className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400 line-through">Premium features</span>
                </div>
              </div>
            </div>

            {/* Free Account Tier */}
            <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-3 sm:p-4 relative">
              <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                RECOMMENDED
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-blue-900 mb-2 sm:mb-3 text-center">
                Free Account
              </h3>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-blue-900"><strong>15 translations/month</strong></span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-blue-900">Free NLLB model</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-blue-900">Translation history</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-blue-900">Saved preferences</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Features Preview */}
          <div className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-sm sm:text-base text-purple-900 mb-2 sm:mb-3 md:mb-4 flex items-center space-x-2">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              <span>Premium Features (Coming Soon)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="text-purple-800">Unlimited translations</span>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="text-purple-800">Premium GPT-4 model</span>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="text-purple-800">Priority processing</span>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="text-purple-800">Advanced tone controls</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={onSignup}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              Sign Up for Free Account (15 translations/month)
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
            >
              Continue with {resetTime} wait
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Free forever • No credit card required • Sign in with Google
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupWallModal;
