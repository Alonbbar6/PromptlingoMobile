import React, { useEffect, useState } from 'react';
import { LogIn, Shield, Zap, History, AlertCircle } from 'lucide-react';
import GoogleLoginButton from './GoogleLoginButton';

const SignInPrompt: React.FC = () => {
  const [showAuthMessage, setShowAuthMessage] = useState(false);

  useEffect(() => {
    // Check if user was redirected due to auth requirement
    const authRequired = localStorage.getItem('auth_required');
    const sessionExpired = localStorage.getItem('session_expired');

    if (authRequired === 'true' || sessionExpired === 'true') {
      setShowAuthMessage(true);
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Auth Required Banner */}
      {showAuthMessage && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Authentication Required
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                You need to sign in to use translation features. Sign up for free to get 15 translations per month!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card text-center">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Sign in to Get Started
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Create a free account to access premium Haitian Creole translation features
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">15 Free Translations</h3>
            <p className="text-sm text-gray-600">
              Get 15 voice translations per month, completely free
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <History className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Save Your History</h3>
            <p className="text-sm text-gray-600">
              Access your translation history anytime, anywhere
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <LogIn className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Premium Features</h3>
            <p className="text-sm text-gray-600">
              Voice synthesis, multiple tones, and more
            </p>
          </div>
        </div>

        {/* Sign in button */}
        <div className="flex flex-col items-center space-y-4">
          <GoogleLoginButton />

          <p className="text-xs text-gray-500 max-w-md">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            Your data is secure and will never be shared.
          </p>
        </div>

        {/* Pro upgrade teaser */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            Need more translations?
          </p>
          <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Upgrade to Pro for unlimited translations
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPrompt;