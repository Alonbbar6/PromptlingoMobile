import { apiClient } from './apiClient';
import { UserPreferences, TranslationHistoryItem } from '../types/auth.types';

export const userService = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await apiClient.get('/api/user/profile');
    return response.data;
  },

  /**
   * Get user preferences
   */
  getPreferences: async (): Promise<{ preferences: UserPreferences }> => {
    const response = await apiClient.get('/api/user/preferences');
    return response.data;
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (preferences: UserPreferences) => {
    const response = await apiClient.post('/api/user/preferences', {
      preferences,
    });
    return response.data;
  },

  /**
   * Get translation history
   */
  getHistory: async (limit = 50, offset = 0): Promise<{
    history: TranslationHistoryItem[];
    total: number;
    limit: number;
    offset: number;
  }> => {
    const response = await apiClient.get('/api/user/history', {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Save translation to history
   */
  saveTranslation: async (translationData: {
    originalText: string;
    translatedText: string;
    sourceLanguage?: string;
    targetLanguage?: string;
    tone?: string;
  }) => {
    const response = await apiClient.post('/api/user/history', translationData);
    return response.data;
  },
};
