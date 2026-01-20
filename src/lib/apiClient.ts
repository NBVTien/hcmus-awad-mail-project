import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management functions (will be set by AuthContext)
let getAccessToken: (() => string | null) | null = null;
let refreshAccessToken: (() => Promise<string>) | null = null;
let logout: (() => Promise<void>) | null = null;

/**
 * Concurrency guard: prevents multiple simultaneous refresh attempts
 *
 * Problem: Multiple 401 responses can trigger concurrent refresh requests:
 *   Request A (401) → refresh #1
 *   Request B (401) → refresh #2  ❌ Unnecessary!
 *   Request C (401) → refresh #3  ❌ Unnecessary!
 *
 * Solution: If a refresh is in progress, subsequent requests await the same promise:
 *   Request A (401) → refresh #1
 *   Request B (401) → await refresh #1  ✅
 *   Request C (401) → await refresh #1  ✅
 *
 * This prevents race conditions and reduces backend load.
 */
let refreshPromise: Promise<string> | null = null;

export const setAuthCallbacks = (callbacks: {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string>;
  logout: () => Promise<void>;
}) => {
  getAccessToken = callbacks.getAccessToken;
  refreshAccessToken = callbacks.refreshAccessToken;
  logout = callbacks.logout;
};

// Request interceptor: Attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken?.();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 and auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Don't try to refresh if:
    // 1. It's already a retry
    // 2. The request was for refreshing the token (avoid infinite loop)
    // 3. The request was for logging in/out (auth endpoints shouldn't trigger refresh)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/logout')
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshAccessToken) {
          throw new Error('Refresh token callback not set');
        }

        // Concurrency guard: if a refresh is already in progress, await it
        // instead of issuing another refresh request
        if (refreshPromise) {
          const newAccessToken = await refreshPromise;

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return apiClient(originalRequest);
        }

        // No refresh in progress, start a new one
        refreshPromise = refreshAccessToken()
          .then((token) => {
            refreshPromise = null; // Clear the promise on success
            return token;
          })
          .catch((error) => {
            refreshPromise = null; // Clear the promise on error
            throw error;
          });

        const newAccessToken = await refreshPromise;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        logout?.().catch(console.error);
        return Promise.reject(refreshError);
      }
    }

    // If it's a 401 on /auth/refresh, we MUST logout immediately
    if (error.response?.status === 401 && originalRequest.url?.includes('/auth/refresh')) {
      logout?.().catch(console.error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
