import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { LogOut, User as UserIcon, Crown, Gift, Settings } from 'lucide-react';
import PricingModal from './PricingModal';
import PromotionCodeModal from './PromotionCodeModal';

interface UserProfileProps {
  onNavigate?: (page: 'landing' | 'translator' | 'tts' | 'pricing' | 'subscription' | 'privacy' | 'refund-policy' | 'settings') => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="User menu"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
        )}
        <span className="text-sm font-medium hidden md:block">{user.name}</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>

            <button
              onClick={() => {
                setShowMenu(false);
                setShowPricingModal(true);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-purple-600 font-medium"
            >
              <Crown className="w-4 h-4" />
              <span>{t('user.upgradePlan')}</span>
            </button>

            <button
              onClick={() => {
                setShowMenu(false);
                setShowPromoModal(true);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-blue-600"
            >
              <Gift className="w-4 h-4" />
              <span>{t('user.redeemCode')}</span>
            </button>

            {onNavigate && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  onNavigate('subscription');
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-gray-700"
              >
                <Settings className="w-4 h-4" />
                <span>Manage Subscription</span>
              </button>
            )}

            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-gray-700"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('user.logout')}</span>
            </button>
          </div>
        </>
      )}

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />

      <PromotionCodeModal
        isOpen={showPromoModal}
        onClose={() => setShowPromoModal(false)}
      />
    </div>
  );
};

export default UserProfile;
