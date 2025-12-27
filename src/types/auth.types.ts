export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  googleId: string;
  subscriptionTier?: string;
  subscription_tier?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  login: (googleResponse: any) => Promise<void>;
  loginWithDevMode: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
    expiresIn: number;
  };
  message: string;
}

export interface TokenRefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  message: string;
}

export interface GoogleResponse {
  credential: string;
}

export interface APIError {
  success: false;
  error: string;
  details?: any;
  statusCode: number;
}

export interface UserPreferences {
  preferred_target_language?: string;
  preferred_tone?: string;
  auto_save_history?: boolean;
  theme?: string;
}

export interface TranslationHistoryItem {
  id: string;
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  tone: string;
  created_at: string;
}
