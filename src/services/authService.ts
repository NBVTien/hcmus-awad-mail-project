import apiClient from '@/lib/apiClient';
import type {
  LoginRequest,
  LoginResponse,
  GoogleAuthRequest,
  GoogleAuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
} from '@/types/auth.types';

/**
 * Real authentication service that communicates with the backend API
 */
export const authService = {
  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  /**
   * Initiate Google OAuth flow (backend redirect-based)
   * Instead of client-side PKCE, we use the backend's redirect flow
   */
  async initiateGoogleAuth(data: GoogleAuthRequest): Promise<GoogleAuthResponse> {
    // Call backend to get Gmail authorization URL
    const response = await apiClient.get('/auth/google/gmail-url', {
      params: {
        frontendUrl: data.redirectUri,
      },
    });

    // Backend returns { data: { url } }
    const authorizationUrl = response.data.data?.url || response.data.url;

    // Return in the format frontend expects
    // Note: state and codeVerifier are not used in backend redirect flow,
    // but we provide them to maintain compatibility with frontend code
    return {
      authorizationUrl,
      state: '', // Not used in backend flow
      codeVerifier: '', // Not used in backend flow
    };
  },

  /**
   * Handle Google OAuth callback
   * In backend redirect flow, the backend handles the callback and redirects
   * to frontend with auth data in URL fragment. Frontend should extract
   * the auth data directly from the URL instead of calling this method.
   *
   * This method is kept for compatibility but won't be used in the redirect flow.
   */
  async handleGoogleCallback(): Promise<LoginResponse> {
    throw new Error(
      'This method is not used in backend redirect flow. ' +
      'Auth data is provided in URL fragment after OAuth callback.'
    );
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await apiClient.post('/auth/refresh', data);
    return response.data;
  },

  /**
   * Logout and invalidate refresh token
   */
  async logout(data: LogoutRequest): Promise<void> {
    await apiClient.post('/auth/logout', data);
  },

  /**
   * Get current user profile
   */
  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};
