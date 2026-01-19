import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthToken } from '@/types/auth.types';
import { setAuthCallbacks } from '@/lib/apiClient';
import { queryClient } from '@/lib/queryClient';

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: AuthToken) => void;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_REFRESH_THRESHOLD = parseFloat(
  import.meta.env.VITE_REFRESH_THRESHOLD || '0.8'
); // 80%

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getAccessToken = useCallback(() => {
    return accessToken;
  }, [accessToken]);

  const refreshAccessToken = useCallback(async (): Promise<string> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Import dynamically to avoid circular dependency
      const { authService } = await import('@/services/authService');
      const response = await authService.refreshToken({ refreshToken });

      setAccessToken(response.accessToken);
      setTokenExpiresAt(response.expiresAt);

      return response.accessToken;
    } catch (error) {
      // If refresh fails, logout
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setUser(null);
      setAccessToken(null);
      setTokenExpiresAt(null);
      throw error;
    }
  }, []);

  // Shared cleanup logic
  const performCleanup = useCallback(async () => {
    // 1. Clear local auth state
    setUser(null);
    setAccessToken(null);
    setTokenExpiresAt(null);
    localStorage.removeItem(REFRESH_TOKEN_KEY);

    // 2. Clear React Query cache (both memory and persistent)
    queryClient.clear();
    try {
      const { persister } = await import('@/lib/persister');
      await persister.removeClient();
    } catch (err) {
      console.error('Failed to clear persistence:', err);
    }
  }, []);

  const login = useCallback((newUser: User, token: AuthToken) => {
    setUser(newUser);
    setAccessToken(token.accessToken);
    setTokenExpiresAt(token.expiresAt);
    localStorage.setItem(REFRESH_TOKEN_KEY, token.refreshToken);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    // Notify other tabs immediately
    const channel = new BroadcastChannel('auth_channel');
    channel.postMessage('LOGOUT');
    channel.close();

    // Call backend logout endpoint
    if (refreshToken) {
      try {
        const { authService } = await import('@/services/authService');
        await authService.logout({ refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Perform local cleanup
    await performCleanup();
  }, [performCleanup]);

  // Set API client callbacks
  useEffect(() => {
    setAuthCallbacks({
      getAccessToken,
      refreshAccessToken,
      logout,
    });
  }, [getAccessToken, refreshAccessToken, logout]);

  // Listen for logout events from other tabs
  useEffect(() => {
    const channel = new BroadcastChannel('auth_channel');

    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'LOGOUT') {
        console.log('Received LOGOUT broadcast');
        performCleanup();
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [performCleanup]);

  // Auto-refresh token at threshold
  useEffect(() => {
    if (!tokenExpiresAt || !accessToken) return;

    const tokenLifetime = tokenExpiresAt - Date.now();
    const refreshTime = tokenLifetime * TOKEN_REFRESH_THRESHOLD;

    if (refreshTime <= 0) {
      // Token already expired or will expire soon, refresh immediately
      refreshAccessToken().catch(() => {
        logout().catch(console.error);
      });
      return;
    }

    const timeout = setTimeout(() => {
      refreshAccessToken().catch(() => {
        logout().catch(console.error);
      });
    }, refreshTime);

    return () => clearTimeout(timeout);
  }, [tokenExpiresAt, accessToken, refreshAccessToken, logout]);

  // Hydrate session on mount
  useEffect(() => {
    const hydrateSession = async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (refreshToken) {
        try {
          const newAccessToken = await refreshAccessToken();
          setAccessToken(newAccessToken);

          // Fetch actual user profile from backend
          const { authService } = await import('@/services/authService');
          const userProfile = await authService.getProfile();
          setUser(userProfile);
        } catch {
          // Refresh failed, clear everything
          await logout();
        }
      }

      setIsLoading(false);
    };

    hydrateSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // Listen for storage events (backup for logout sync)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === REFRESH_TOKEN_KEY && event.newValue === null) {
        console.log('Detected storage clear, performing cleanup');
        performCleanup();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [performCleanup]);

  const value: AuthContextValue = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    logout,
    refreshAccessToken,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
