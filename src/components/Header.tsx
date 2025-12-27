import React from 'react';
import { Mic, Languages, Volume2, Cpu, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import UserProfile from './UserProfile';
import GoogleLoginButton from './GoogleLoginButton';
import LanguageSelector from './LanguageSelector';

type AppPage = 'translator' | 'tts' | 'wasm';

interface HeaderProps {
  currentPage?: AppPage;
  onPageChange?: (page: AppPage) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage = 'translator', onPageChange }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 Header Auth State:', { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Mic className="h-8 w-8 text-primary-500" />
              <Volume2 className="h-6 w-6 text-secondary-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('app.title')}
              </h1>
              <p className="text-sm text-gray-600">
                {t('app.subtitle')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Navigation */}
            {onPageChange && (
              <nav className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onPageChange('translator')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'translator'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Mic className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('nav.translator')}</span>
                </button>
                <button
                  onClick={() => onPageChange('tts')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'tts'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Volume2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('nav.tts')}</span>
                </button>
                <button
                  onClick={() => onPageChange('wasm')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'wasm'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Cpu className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('nav.wasm')}</span>
                </button>
              </nav>
            )}
            
            {/* Auth Section */}
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <UserProfile />
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{t('nav.signIn')}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && !isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.signInTitle')}</h2>
              <p className="text-gray-600">{t('auth.signInSubtitle')}</p>
            </div>
            <GoogleLoginButton onSuccess={() => {
              setShowLoginModal(false);
              // Navigate to translator after successful login if onPageChange is available
              onPageChange?.('translator');
            }} />
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>{t('auth.dataSecure')}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
