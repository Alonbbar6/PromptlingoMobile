import axios from 'axios';
import { LoginResponse, TokenRefreshResponse, User } from '../types/auth.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

// SECURITY: Configure axios to send HttpOnly cookies with requests
const axiosConfig = {
  withCredentials: true, // Send cookies with cross-origin requests
};

export const authService = {
  /**
   * Login with Google ID token
   * Tokens will be set as HttpOnly cookies by the server
   */
  loginWithGoogle: async (idToken: string): Promise<LoginResponse> => {
    const response = await axios.post(
      `${API_URL}/api/auth/google/login`,
      { idToken },
      axiosConfig
    );
    return response.data;
  },

  /**
   * Developer mode login (only works when DEV_MODE=true on backend)
   * Tokens will be set as HttpOnly cookies by the server
   */
  loginWithDevMode: async (): Promise<LoginResponse> => {
    const response = await axios.post(
      `${API_URL}/api/auth/dev/login`,
      {},
      axiosConfig
    );
    return response.data;
  },

  /**
   * Logout user
   * Server will clear HttpOnly cookies
   */
  logout: async (): Promise<void> => {
    await axios.post(`${API_URL}/api/auth/logout`, {}, axiosConfig);
  },

  /**
   * Verify access token from cookie
   */
  verifyToken: async (): Promise<{ valid: boolean; user: User }> => {
    const response = await axios.get(
      `${API_URL}/api/auth/verify`,
      axiosConfig
    );
    return response.data.data;
  },

  /**
   * Refresh access token from cookie
   * New tokens will be set as HttpOnly cookies by the server
   */
  refreshAccessToken: async (): Promise<TokenRefreshResponse> => {
    const response = await axios.post(
      `${API_URL}/api/auth/refresh`,
      {},
      axiosConfig
    );
    return response.data;
  },

  /**
   * Get current user using cookie authentication
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await axios.get(
      `${API_URL}/api/auth/user`,
      axiosConfig
    );
    return response.data.data;
  },
};
