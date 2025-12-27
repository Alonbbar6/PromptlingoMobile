import React, { useState } from 'react';
import { X, Gift, Check, AlertCircle } from 'lucide-react';
import { promotionService } from '../services/promotionService';

interface PromotionCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PromotionCodeModal: React.FC<PromotionCodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [promoDetails, setPromoDetails] = useState<any>(null);

  const handleRedeem = async () => {
    if (!code.trim()) {
      setError('Please enter a promotion code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await promotionService.redeemCode(code.trim().toUpperCase());

      if (result.success) {
        setSuccess(true);
        setPromoDetails(result.promotion);
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 2000);
      } else {
        setError(result.error || 'Failed to redeem code');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError(null);
    setSuccess(false);
    setPromoDetails(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Gift className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Redeem Promotion Code</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Code Redeemed Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                {promoDetails?.description || 'Your promotion has been activated'}
              </p>
              <p className="text-sm text-gray-500">
                Expires: {promoDetails?.expiresAt ? new Date(promoDetails.expiresAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Enter your promotion code to unlock unlimited translations for a limited time.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700 mb-2">
                    Promotion Code
                  </label>
                  <input
                    id="promo-code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                    disabled={loading}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !loading) {
                        handleRedeem();
                      }
                    }}
                  />
                </div>

                {error && (
                  <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleRedeem}
                  disabled={loading || !code.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Redeeming...
                    </span>
                  ) : (
                    'Redeem Code'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionCodeModal;
