import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { LanguageProvider } from './contexts/LanguageContext';
import BrandedHeader from './components/BrandedHeader';
import { LandingPage } from './components/LandingPage';
import PricingPage from './pages/PricingPage';
import SubscriptionPage from './pages/SubscriptionPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import OnboardingTutorial from './components/OnboardingTutorial';
import CookieConsentBanner from './components/CookieConsentBanner';
import MainContent from './components/MainContent';
import ConversationHistory from './components/ConversationHistory';
import TextToSpeechPage from './components/TextToSpeechPage';
import SignInPrompt from './components/SignInPrompt';
import './index.css';

type AppPage = 'landing' | 'translator' | 'tts' | 'pricing' | 'subscription' | 'privacy' | 'refund-policy' | 'settings';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

/**
 * AppWithLanding - Enhanced App with integrated landing page
 * Combines existing PromptLingo functionality with new brand UI
 *
 * To use this version, update index.tsx to import AppWithLanding instead of App
 */

// Inner component with auth access
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();

  // Check for auth flags on mount
  useEffect(() => {
    const authRequired = localStorage.getItem('auth_required');
    const sessionExpired = localStorage.getItem('session_expired');

    if (authRequired === 'true') {
      showToast('Please sign in to use this feature. Sign up for free to get 15 translations per month!', 'warning', 7000);
      localStorage.removeItem('auth_required');
      setShowSignInPrompt(true);
      setCurrentPage('translator');
    } else if (sessionExpired === 'true') {
      showToast('Your session has expired. Please sign in again to continue.', 'warning', 7000);
      localStorage.removeItem('session_expired');
      setShowSignInPrompt(true);
      setCurrentPage('translator');
    }
  }, [showToast]);

  // Show onboarding tutorial for new users
  useEffect(() => {
    if (isAuthenticated) {
      setShowSignInPrompt(false);

      // Check if user has seen onboarding
      const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
      if (!hasSeenTutorial && currentPage === 'translator') {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, currentPage]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handlePageChange = (page: AppPage) => {
    // Allow free navigation - users can explore the app
    // Authentication is enforced when they actually try to use features (via API)
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-backgroundLight">
      {/* Onboarding Tutorial Overlay */}
      {showOnboarding && (
        <OnboardingTutorial
          onComplete={() => {
            localStorage.setItem('hasSeenTutorial', 'true');
            setShowOnboarding(false);
          }}
          onSkip={() => {
            localStorage.setItem('hasSeenTutorial', 'true');
            setShowOnboarding(false);
          }}
        />
      )}

      {/* Branded Header */}
      <BrandedHeader
        currentPage={currentPage}
        onPageChange={handlePageChange}
        showNavigation={currentPage !== 'landing'}
      />

      {/* Page Content */}
      {currentPage === 'landing' && (
        <LandingPage onGetStarted={() => handlePageChange('translator')} />
      )}

      {currentPage === 'pricing' && (
        <PricingPage />
      )}

      {currentPage === 'subscription' && (
        <SubscriptionPage />
      )}

      {currentPage === 'privacy' && (
        <PrivacyPolicyPage />
      )}

      {currentPage === 'refund-policy' && (
        <RefundPolicyPage />
      )}

      {currentPage === 'settings' && (
        <AccountSettingsPage />
      )}

      {currentPage === 'translator' && (
        <main className="container mx-auto px-4 py-8">
          {showSignInPrompt ? (
            <SignInPrompt />
          ) : (
            <>
              <MainContent />
              <ConversationHistory />
            </>
          )}
        </main>
      )}

      {currentPage === 'tts' && (
        <main className="container mx-auto px-4 py-8">
          <TextToSpeechPage onBack={() => handlePageChange('translator')} />
        </main>
      )}

      {/* Cookie Consent Banner - GDPR Compliance */}
      <CookieConsentBanner />
    </div>
  );
};

function AppWithLanding() {
  // Debug: Log Google Client ID on mount
  React.useEffect(() => {
    console.log('🔑 Google Client ID:', GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <TranslationProvider>
              <AppContent />
            </TranslationProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  );
}

export default AppWithLanding;
