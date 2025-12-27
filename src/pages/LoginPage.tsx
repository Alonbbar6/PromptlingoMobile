import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GoogleLoginButton from '../components/GoogleLoginButton';

const LoginPage: React.FC = () => {
  const { isAuthenticated, loginWithDevMode } = useAuth();
  const navigate = useNavigate();
  const [isDevMode] = useState(process.env.REACT_APP_DEV_MODE === 'true');

  // Debug logging
  console.log('REACT_APP_DEV_MODE:', process.env.REACT_APP_DEV_MODE);
  console.log('isDevMode:', isDevMode);

  useEffect(() => {
    // If already authenticated, redirect to home
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSuccess = () => {
    navigate('/', { replace: true });
  };

  const handleDevLogin = async () => {
    try {
      await loginWithDevMode();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Dev login failed:', error);
      alert('Developer login failed. Make sure DEV_MODE is enabled on the backend.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <span className="text-3xl">🌍</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PromptLingo</h1>
            <p className="text-gray-600">
              Secure translation with advanced AI
            </p>
          </div>

          {/* Google Sign-In Button */}
          <div className="mb-6">
            <GoogleLoginButton onSuccess={handleLoginSuccess} />
          </div>

          {/* Developer Mode Login Button */}
          {isDevMode && (
            <div className="mb-6">
              <button
                onClick={handleDevLogin}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>🔧</span>
                <span>Developer Login (Test Mode)</span>
              </button>
              <p className="text-xs text-yellow-600 mt-2 text-center">
                Skip Google OAuth - For testing only
              </p>
            </div>
          )}

          {/* Features */}
          <div className="space-y-3 mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">Secure & Private</p>
                <p className="text-xs text-gray-500">Your data stays protected</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">Advanced AI</p>
                <p className="text-xs text-gray-500">Powered by GPT & ElevenLabs</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">Translation History</p>
                <p className="text-xs text-gray-500">Access your past translations</p>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              We use Google authentication for secure access.
            </p>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need maximum security?{' '}
            <a href="/enterprise" className="text-blue-600 hover:text-blue-700 font-medium">
              Learn about self-hosting
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
