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

    // Transform backend response to frontend format
    const backendData = response.data;
    return {
      user: {
        id: backendData.user.id,
        email: backendData.user.email,
        displayName: backendData.user.name,
        profilePicture: null,
        authMethod: 'email' as const,
        createdAt: new Date().toISOString(),
      },
      token: {
        accessToken: backendData.accessToken,
        refreshToken: backendData.refreshToken,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
        tokenType: 'Bearer' as const,
        scope: 'email',
      },
    };
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

    // Backend returns { accessToken, refreshToken }
    const backendData = response.data;
    return {
      accessToken: backendData.accessToken,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
      tokenType: 'Bearer' as const,
    };
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

    // Transform backend response to frontend User format
    const backendData = response.data;
    return {
      id: backendData.id,
      email: backendData.email,
      displayName: backendData.name,
      profilePicture: null,
      authMethod: (backendData.googleId ? 'google' : 'email') as const,
      createdAt: backendData.createdAt || new Date().toISOString(),
    };
  },
};
