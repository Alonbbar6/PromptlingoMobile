import React, { useState } from 'react';
import { Shield, Lock, Clock, AlertTriangle, Info, Trash2, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import secureStorage from '../utils/secureStorage';

const PrivacySettings: React.FC = () => {
  const { state, dispatch } = useTranslation();
  const { user } = useAuth();
  const [showThirdPartyWarning, setShowThirdPartyWarning] = useState(false);

  const encryptionSupported = typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
  const historyCount = state.translationHistory.length;

  const handleClearHistory = () => {
    if (window.confirm('⚠️  Are you sure you want to permanently delete your entire translation history?\n\nThis action cannot be undone.')) {
      dispatch({ type: 'CLEAR_HISTORY', payload: { userId: user?.id } });
    }
  };

  const calculateOldestItem = () => {
    if (historyCount === 0) return null;

    const oldest = state.translationHistory[state.translationHistory.length - 1];
    const now = Date.now();
    const age = now - new Date(oldest.timestamp).getTime();
    const days = Math.floor(age / (1000 * 60 * 60 * 24));

    return { date: oldest.timestamp, days };
  };

  const oldestItem = calculateOldestItem();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Privacy & Security</h1>
          <p className="text-gray-600">Manage how your data is stored and protected</p>
        </div>
      </div>

      {/* Encryption Status */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Lock className={`h-6 w-6 mt-1 ${encryptionSupported ? 'text-green-600' : 'text-red-600'}`} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">End-to-End Encryption</h2>
              <p className="text-sm text-gray-600 mt-1">
                {encryptionSupported ? (
                  <>Your translation history is encrypted using AES-256-GCM before being stored in your browser.</>
                ) : (
                  <>Your browser doesn't support Web Crypto API. History stored in plain text.</>
                )}
              </p>
              {encryptionSupported && (
                <div className="mt-2 flex items-center space-x-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                  <Shield className="h-3 w-3" />
                  <span>Protected from browser extensions and device access</span>
                </div>
              )}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${encryptionSupported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {encryptionSupported ? 'Enabled' : 'Unavailable'}
          </div>
        </div>
      </div>

      {/* History Information */}
      <div className="card">
        <div className="flex items-start space-x-3">
          <Clock className="h-6 w-6 mt-1 text-blue-600" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Translation History</h2>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Items stored</span>
                <span className="font-medium">{historyCount} / 50</span>
              </div>
              {oldestItem && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Oldest item</span>
                  <span className="font-medium">{oldestItem.days} days ago</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Auto-deletion</span>
                <span className="font-medium">After 30 days</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Storage location</span>
                <span className="font-medium">Your browser only</span>
              </div>
            </div>

            {historyCount > 0 && (
              <button
                onClick={handleClearHistory}
                className="mt-4 flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All History</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Third-Party Services Warning */}
      <div className="card bg-yellow-50 border-yellow-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 mt-1 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Third-Party API Disclosure</h2>
            <p className="text-sm text-gray-700 mt-1">
              While your history is encrypted locally, your translations pass through third-party services during processing:
            </p>

            <button
              onClick={() => setShowThirdPartyWarning(!showThirdPartyWarning)}
              className="mt-3 flex items-center space-x-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
            >
              {showThirdPartyWarning ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showThirdPartyWarning ? 'Hide' : 'Show'} Services</span>
            </button>

            {showThirdPartyWarning && (
              <div className="mt-4 space-y-3">
                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <div className="font-medium text-gray-900">OpenAI Whisper</div>
                  <div className="text-xs text-gray-600 mt-1">Receives: Audio recordings for transcription</div>
                  <div className="text-xs text-gray-600">Retention: 30 days (per OpenAI policy)</div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <div className="font-medium text-gray-900">OpenAI GPT-4 / Meta NLLB</div>
                  <div className="text-xs text-gray-600 mt-1">Receives: Text for translation</div>
                  <div className="text-xs text-gray-600">Retention: Not used for training (API terms)</div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-yellow-200">
                  <div className="font-medium text-gray-900">ElevenLabs</div>
                  <div className="text-xs text-gray-600 mt-1">Receives: Text for speech synthesis</div>
                  <div className="text-xs text-gray-600">Retention: Deleted after processing</div>
                </div>

                <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
                  <p className="text-xs text-yellow-800 font-medium">
                    ⚠️  To achieve complete privacy, you would need to run all AI models locally on your device, which is not currently feasible for real-time translation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* What We Don't Store */}
      <div className="card bg-green-50 border-green-200">
        <div className="flex items-start space-x-3">
          <Shield className="h-6 w-6 mt-1 text-green-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">What PromptLingo Does NOT Store</h2>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Your conversation content (text/audio)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Your translation history (stored locally only)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Audio recordings (deleted within seconds)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Transcription text (not logged or saved)</span>
              </li>
            </ul>

            <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 text-xs text-green-700">
                <Info className="h-4 w-4" />
                <span className="font-medium">We only store account info, usage metadata, and subscription status</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-center text-sm text-gray-500">
        <p>For complete privacy details, see our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a></p>
        <p className="mt-1">Questions? Contact us at <a href="mailto:privacy@promptlingo.com" className="text-blue-600 hover:underline">privacy@promptlingo.com</a></p>
      </div>
    </div>
  );
};

export default PrivacySettings;
