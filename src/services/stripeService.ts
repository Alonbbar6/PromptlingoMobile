/**
 * Stripe Service for Frontend
 * Handles Stripe checkout and subscription management on the client side
 */

import { apiClient } from './apiClient';

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  priceId?: string;
  savings?: string;
  features: string[];
}

export interface SubscriptionStatus {
  subscription_tier: string;
  subscription_status: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  subscription_cancel_at_period_end: boolean;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
}

/**
 * Get available pricing plans
 */
export const getPricingPlans = async (): Promise<PricingPlan[]> => {
  try {
    const response = await apiClient.get('/api/stripe/pricing');
    return response.data.plans;
  } catch (error: any) {
    console.error('Failed to get pricing plans:', error);
    throw error;
  }
};

/**
 * Create a checkout session and redirect to Stripe Checkout
 * @param planType - 'essential', 'monthly', or 'yearly'
 */
export const createCheckoutSession = async (planType: 'essential' | 'monthly' | 'yearly'): Promise<void> => {
  try {
    console.log(`Creating checkout session for ${planType} plan...`);

    const response = await apiClient.post('/api/stripe/create-checkout-session', {
      planType,
    });

    // Redirect to Stripe Checkout
    if (response.data.url) {
      window.location.href = response.data.url;
    } else {
      throw new Error('No checkout URL received');
    }
  } catch (error: any) {
    console.error('Failed to create checkout session:', error);
    throw new Error(error.response?.data?.message || 'Failed to start checkout process');
  }
};

/**
 * Get subscription status for current user
 */
export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    const response = await apiClient.get('/api/stripe/subscription-status');
    return response.data.subscription;
  } catch (error: any) {
    console.error('Failed to get subscription status:', error);
    throw error;
  }
};

/**
 * Create a billing portal session for subscription management
 */
export const createBillingPortalSession = async (): Promise<void> => {
  try {
    console.log('Creating billing portal session...');

    const response = await apiClient.post('/api/stripe/create-portal-session');

    // Redirect to Stripe Billing Portal
    if (response.data.url) {
      window.location.href = response.data.url;
    } else {
      throw new Error('No portal URL received');
    }
  } catch (error: any) {
    console.error('Failed to create billing portal session:', error);
    throw new Error(error.response?.data?.message || 'Failed to open billing portal');
  }
};

/**
 * Cancel subscription (at end of billing period)
 */
export const cancelSubscription = async (): Promise<void> => {
  try {
    console.log('Canceling subscription...');

    await apiClient.post('/api/stripe/cancel-subscription');

    console.log('Subscription canceled successfully');
  } catch (error: any) {
    console.error('Failed to cancel subscription:', error);
    throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
  }
};