import { apiClient } from './apiClient';

export interface PromotionCode {
  code: string;
  description: string;
  expiresAt: string;
}

export interface RedeemPromotionResponse {
  success: boolean;
  promotion?: {
    id: string;
    code: string;
    description: string;
    expiresAt: string;
    durationDays: number;
  };
  error?: string;
}

export interface ActivePromotionResponse {
  hasActivePromotion: boolean;
  promotion?: {
    code: string;
    description: string;
    expires_at: string;
  };
}

class PromotionService {
  /**
   * Redeem a promotion code
   */
  async redeemCode(code: string): Promise<RedeemPromotionResponse> {
    try {
      const response = await apiClient.post<RedeemPromotionResponse>(
        '/api/promotions/redeem',
        { code }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        error: 'Failed to redeem promotion code'
      };
    }
  }

  /**
   * Check if user has an active promotion
   */
  async checkActivePromotion(): Promise<ActivePromotionResponse> {
    try {
      const response = await apiClient.get<ActivePromotionResponse>(
        '/api/promotions/active'
      );
      return response.data;
    } catch (error) {
      return {
        hasActivePromotion: false
      };
    }
  }

  /**
   * Get all promotions for the current user
   */
  async getMyPromotions() {
    try {
      const response = await apiClient.get('/api/promotions/my-promotions');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate a promotion code without redeeming it
   */
  async validateCode(code: string) {
    try {
      const response = await apiClient.post('/api/promotions/validate', { code });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const promotionService = new PromotionService();
