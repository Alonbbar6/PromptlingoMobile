import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth.types';
import { authService } from '../services/authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// SECURITY: Only store user data in localStorage, NOT tokens
// Tokens are stored as HttpOnly cookies (protected from XSS)
const USER_KEY = 'promptlingo_user';

const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearStoredUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔐 Initializing auth...');

      try {
        const storedUser = getStoredUser();
        console.log('🔐 Stored user:', { hasUser: !!storedUser });

        // Try to verify session with cookie
        try {
          // Verify token from cookie is still valid with timeout
          const response = await Promise.race([
            authService.verifyToken(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Token verification timeout')), 5000)
            )
          ]) as { valid: boolean; user: User };

          if (response.valid) {
            // Use user from server response (most up-to-date)
            setUser(response.user);
            setStoredUser(response.user);
            console.log('✅ Session valid, user restored');
          } else {
            // Token invalid, clear user
            console.log('⚠️ Session invalid, clearing user');
            clearStoredUser();
          }
        } catch (error) {
          // Token verification failed (no cookie or expired)
          console.log('ℹ️ No valid session found:', error);
          clearStoredUser();
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        setIsLoading(false);
        console.log('✅ Auth initialization complete');
      }
    };

    initAuth();
  }, []);

  const login = async (googleResponse: any) => {
    try {
      setIsLoading(true);
      const idToken = googleResponse.credential;

      console.log('🔑 Attempting login with Google token...');

      // Send token to backend (cookies will be set by server)
      const response = await authService.loginWithGoogle(idToken);

      console.log('✅ Login successful!');

      // Store user data only (tokens are in HttpOnly cookies)
      const userData = response.data.user;
      setUser(userData);
      setStoredUser(userData);
    } catch (error: any) {
      console.error('❌ Login failed:', error);

      // Log detailed error information
      if (error.response) {
        console.error('🔴 Backend Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          errorMessage: error.response.data?.message || error.response.data?.error
        });
      } else if (error.request) {
        console.error('🔴 No response received from backend');
      } else {
        console.error('🔴 Error setting up request:', error.message);
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDevMode = async () => {
    try {
      setIsLoading(true);
      console.log('🔧 Attempting developer mode login...');

      // Call dev mode login endpoint (cookies will be set by server)
      const response = await authService.loginWithDevMode();

      console.log('✅ Developer login successful!');

      // Store user data only (tokens are in HttpOnly cookies)
      const userData = response.data.user;
      setUser(userData);
      setStoredUser(userData);
    } catch (error: any) {
      console.error('❌ Developer login failed:', error);

      // Log detailed error information
      if (error.response) {
        console.error('🔴 Backend Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          errorMessage: error.response.data?.message || error.response.data?.error
        });
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Call logout endpoint (server will clear cookies)
      await authService.logout();

      // Clear user data
      clearStoredUser();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear user data anyway
      clearStoredUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      // Call refresh endpoint (cookies will be updated by server)
      await authService.refreshAccessToken();

      // User data should remain the same (no user in refresh response)
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear everything and logout
      clearStoredUser();
      setUser(null);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error: null,
    accessToken: null, // SECURITY: No longer exposed (in HttpOnly cookie)
    login: async (googleResponse: any) => login(googleResponse),
    loginWithDevMode,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
