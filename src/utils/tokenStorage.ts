import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_KEY = 'promptlingo_access_token';
const REFRESH_TOKEN_KEY = 'promptlingo_refresh_token';
const TOKEN_EXPIRY_KEY = 'promptlingo_token_expiry';
const USER_KEY = 'promptlingo_user';

interface DecodedToken {
  exp: number;
  userId: string;
  type: string;
}

export const tokenStorage = {
  /**
   * Save tokens to localStorage
   */
  saveTokens: (accessToken: string, refreshToken: string, expiresIn: number): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    // Calculate expiration time
    const expiryTime = Date.now() + (expiresIn * 1000);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  },

  /**
   * Get access token from localStorage
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Get user from localStorage
   */
  getUser: (): any | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Save user to localStorage
   */
  setUser: (user: any): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Clear all tokens and user data
   */
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Check if tokens exist
   */
  hasTokens: (): boolean => {
    return !!(tokenStorage.getAccessToken() && tokenStorage.getRefreshToken());
  },

  /**
   * Check if access token is expired
   */
  isTokenExpired: (): boolean => {
    const token = tokenStorage.getAccessToken();
    if (!token) return true;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  },

  /**
   * Get time until token expiration in seconds
   */
  getTimeUntilExpiration: (): number => {
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryStr) return 0;

    const expiryTime = parseInt(expiryStr, 10);
    const timeLeft = expiryTime - Date.now();
    return timeLeft > 0 ? Math.floor(timeLeft / 1000) : 0;
  },
};
