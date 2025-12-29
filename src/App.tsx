import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import MainContent from './components/MainContent';
import ConversationHistory from './components/ConversationHistory';
import TextToSpeechPage from './components/TextToSpeechPage';
import { WasmDemo } from './components/WasmDemo';
import LiveTranscriptionCaptions from './components/LiveTranscriptionCaptions';
import SignInPrompt from './components/SignInPrompt';
import './index.css';

type AppPage = 'translator' | 'tts' | 'wasm' | 'live';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

// Inner component that has access to AuthContext
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>('translator');
  const { isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();

  // Check for auth flags on mount
  useEffect(() => {
    const authRequired = localStorage.getItem('auth_required');
    const sessionExpired = localStorage.getItem('session_expired');

    if (authRequired === 'true') {
      showToast('Please sign in to use this feature. Sign up for free to get 15 translations per month!', 'warning', 7000);
      localStorage.removeItem('auth_required');
    } else if (sessionExpired === 'true') {
      showToast('Your session has expired. Please sign in again to continue.', 'warning', 7000);
      localStorage.removeItem('session_expired');
    }
  }, [showToast]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'translator' ? (
          // Translator page - available to everyone (free NLLB model)
          <>
            <MainContent />
            {isAuthenticated && <ConversationHistory />}
          </>
        ) : !isAuthenticated ? (
          // Other pages require authentication
          <SignInPrompt />
        ) : (
          // Show authenticated-only pages
          <>
            {currentPage === 'tts' ? (
              <TextToSpeechPage onBack={() => setCurrentPage('translator')} />
            ) : currentPage === 'live' ? (
              <LiveTranscriptionCaptions />
            ) : (
              <WasmDemo />
            )}
          </>
        )}
      </main>
    </div>
  );
};

function App() {
  // Debug: Log Google Client ID on mount
  React.useEffect(() => {
    console.log('🔑 Google Client ID:', GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('🔑 Full Client ID:', GOOGLE_CLIENT_ID);
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

export default App;
