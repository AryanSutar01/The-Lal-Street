import { useState, useEffect, useCallback } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'; // Default for development
const AUTH_TOKEN_KEY = 'admin_auth_token';
const AUTH_EXPIRY_KEY = 'admin_auth_expiry';
const AUTH_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get the admin token for API authentication
 */
export const getAdminToken = (): string | null => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
    
    if (!token || !expiry) {
      return null;
    }
    
    const now = Date.now();
    const expiryTime = parseInt(expiry, 10);
    
    if (now > expiryTime) {
      // Token expired
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_EXPIRY_KEY);
      return null;
    }
    
    // Return the admin password as token (in production, use JWT)
    return ADMIN_PASSWORD;
  } catch {
    return null;
  }
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  // Check if token exists and is still valid
  const checkAuth = useCallback(() => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);

      if (!token || !expiry) {
        setAuthState({ isAuthenticated: false, isLoading: false });
        return false;
      }

      const now = Date.now();
      const expiryTime = parseInt(expiry, 10);

      if (now > expiryTime) {
        // Token expired
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_EXPIRY_KEY);
        setAuthState({ isAuthenticated: false, isLoading: false });
        return false;
      }

      setAuthState({ isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState({ isAuthenticated: false, isLoading: false });
      return false;
    }
  }, []);

  // Login with password
  const login = useCallback((password: string): boolean => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
      const expiry = Date.now() + AUTH_DURATION;
      localStorage.setItem(AUTH_TOKEN_KEY, adminPassword); // Store password as token for API
      localStorage.setItem(AUTH_EXPIRY_KEY, expiry.toString());
      setAuthState({ isAuthenticated: true, isLoading: false });
      return true;
    }
    return false;
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_EXPIRY_KEY);
    setAuthState({ isAuthenticated: false, isLoading: false });
  }, []);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  };
}
