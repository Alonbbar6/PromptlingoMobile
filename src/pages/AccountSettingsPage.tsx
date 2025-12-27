import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AccountDeletionFlow from '../components/AccountDeletionFlow';

const AccountSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-backgroundLight py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Please sign in to access account settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-backgroundLight py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

        {/* Account Information */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900">{user.name || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <p className="text-gray-500 text-sm font-mono">{user.id}</p>
            </div>
          </div>
        </div>

        {/* Subscription Information */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Plan</label>
              <p className="text-gray-900">
                {user.subscriptionTier === 'free' && 'Free (10 translations/month)'}
                {user.subscriptionTier === 'student' && 'Student - $9.99/month'}
                {user.subscriptionTier === 'professional' && 'Professional - $19.99/month'}
              </p>
            </div>
            {user.subscriptionTier !== 'free' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="text-green-600 font-medium">Active</p>
              </div>
            )}
          </div>
          <div className="mt-4">
            <a
              href="/pricing"
              className="text-primary-skyBlue hover:text-primary-indigo font-medium"
            >
              View pricing plans →
            </a>
          </div>
        </div>

        {/* Privacy & Data */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Data</h2>
          <div className="space-y-3">
            <div>
              <button
                onClick={() => {
                  localStorage.removeItem('consent_preferences');
                  window.location.reload();
                }}
                className="text-primary-skyBlue hover:text-primary-indigo font-medium"
              >
                Manage Cookie Preferences
              </button>
            </div>
            <div>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-skyBlue hover:text-primary-indigo font-medium block"
              >
                Privacy Policy
              </a>
            </div>
            <div>
              <a
                href="/refund-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-skyBlue hover:text-primary-indigo font-medium block"
              >
                Refund Policy
              </a>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h2>
          <div className="space-y-3">
            <button
              onClick={logout}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Account Deletion - Danger Zone */}
        <AccountDeletionFlow />
      </div>
    </div>
  );
};

export default AccountSettingsPage;
