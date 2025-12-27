import React, { useState } from 'react';
import axios from 'axios';

interface AccountDeletionFlowProps {
  onClose?: () => void;
}

const AccountDeletionFlow: React.FC<AccountDeletionFlowProps> = ({ onClose }) => {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'initial' | 'confirm' | 'password' | 'export' | 'processing' | 'success' | 'error'>('initial');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDeleteClick = () => {
    setShowModal(true);
    setStep('initial');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setStep('initial');
    setPassword('');
    setError('');
    if (onClose) onClose();
  };

  const handleExportData = async () => {
    try {
      setStep('processing');
      const response = await axios.get('/api/auth/export-data', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Download the data as JSON
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `promptlingo-data-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      setStep('confirm');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export data');
      setStep('error');
    }
  };

  const handleSkipExport = () => {
    setStep('confirm');
  };

  const handleConfirmDeletion = () => {
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your password to confirm deletion');
      return;
    }

    try {
      setStep('processing');
      
      // Call the account deletion endpoint
      await axios.delete('/api/auth/delete-account', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data: {
          password: password,
        },
      });

      setStep('success');
      
      // Clear local storage and redirect after a delay
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/';
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setStep('error');
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'initial':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Delete Your Account</h2>
            <p className="text-gray-700 mb-4">
              Before you proceed, please note:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>This action cannot be undone</li>
              <li>All your translation history will be permanently deleted</li>
              <li>Your active subscription will be cancelled</li>
              <li>You will lose access to all saved translations</li>
              <li>Your account data will be removed from our systems</li>
            </ul>
            <p className="text-gray-700 mb-6">
              Would you like to export your data before deleting your account?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium transition text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSkipExport}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded font-medium transition text-white"
              >
                Skip Export
              </button>
              <button
                onClick={handleExportData}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition text-white"
              >
                Export My Data
              </button>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Are You Absolutely Sure?</h2>
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
              <p className="text-red-800 font-semibold mb-2">⚠️ Warning: This is permanent!</p>
              <p className="text-red-700">
                Once you delete your account, there is no going back. All your data will be permanently erased from our servers.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium transition text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletion}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium transition text-white"
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        );

      case 'password':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Confirm Your Password</h2>
            <p className="text-gray-700 mb-4">
              Please enter your password to confirm account deletion:
            </p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium transition text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium transition text-white"
                >
                  Delete Account
                </button>
              </div>
            </form>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Processing your request...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Account Deleted Successfully</h2>
            <p className="text-gray-700">
              Your account has been permanently deleted. You will be redirected to the homepage shortly.
            </p>
          </div>
        );

      case 'error':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Error</h2>
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium transition text-gray-900"
              >
                Close
              </button>
              <button
                onClick={() => setStep('initial')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition text-white"
              >
                Try Again
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Delete Account Button (to be placed in account settings) */}
      <div className="border border-red-300 rounded-lg p-6 bg-red-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Danger Zone</h3>
        <p className="text-gray-700 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteClick}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium transition text-white"
        >
          Delete Account
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {renderStepContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountDeletionFlow;

/**
 * Usage:
 * 
 * 1. Import this component in your account settings page:
 *    import AccountDeletionFlow from './components/AccountDeletionFlow';
 * 
 * 2. Add it to your account settings JSX:
 *    <AccountDeletionFlow />
 * 
 * 3. Make sure you have the following backend endpoints:
 *    - GET /api/auth/export-data (to export user data)
 *    - DELETE /api/auth/delete-account (to delete the account)
 * 
 * 4. The component expects a JWT token in localStorage under the key 'token'
 */
