/**
 * Usage Service
 * Fetches user's API usage statistics
 */

import { apiClient } from './apiClient';

export interface UsageData {
  tier: 'free' | 'pro';
  used: number;
  limit: number | null;
  unlimited: boolean;
  resetDate: string;
  remaining: number | null;
}

export interface UsageResponse {
  success: boolean;
  data: UsageData;
}

/**
 * Get current user's usage statistics
 */
export const getUsage = async (): Promise<UsageData> => {
  try {
    const response = await apiClient.get<UsageResponse>('/api/usage');
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to fetch usage:', error);
    throw error;
  }
};

export const usageService = {
  getUsage
};