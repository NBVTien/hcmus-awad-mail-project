import type {
  LoginRequest,
  LoginResponse,
  GoogleAuthRequest,
  GoogleAuthResponse,
  GoogleCallbackRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
} from '@/types/auth.types';
import {
  randomDelay,
  isValidEmail,
  generateMockUser,
  generateMockTokens,
  generateMockToken,
  throwApiError,
} from './mockHelpers';

export const mockAuthService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    await randomDelay(200, 500);

    if (!isValidEmail(data.email)) {
      throwApiError('INVALID_EMAIL', 'Invalid email format', 400);
    }

    if (data.password.length < 8) {
      throwApiError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    return {
      user: generateMockUser(data.email, 'email'),
      token: generateMockTokens(),
    };
  },

  async initiateGoogleAuth(data: GoogleAuthRequest): Promise<GoogleAuthResponse> {
    await randomDelay(100, 200);

    const state = crypto.randomUUID();
    const codeVerifier = crypto.randomUUID();

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock-client-id',
      redirect_uri: data.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      code_challenge: btoa(codeVerifier), // Simplified PKCE
      code_challenge_method: 'S256',
    });

    return {
      authorizationUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      state,
      codeVerifier,
    };
  },

  async handleGoogleCallback(data: GoogleCallbackRequest): Promise<LoginResponse> {
    await randomDelay(300, 500);

    if (!data.code) {
      throwApiError('INVALID_CODE', 'Invalid or expired authorization code', 401);
    }

    // In demo mode, accept any code/state combination
    const mockEmail = 'googleuser@gmail.com';

    return {
      user: generateMockUser(mockEmail, 'google'),
      token: generateMockTokens(),
    };
  },

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    await randomDelay(100, 300);

    if (!data.refreshToken) {
      throwApiError('INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token', 401);
    }

    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    return {
      accessToken: generateMockToken(),
      expiresAt,
      tokenType: 'Bearer',
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async logout(_data: LogoutRequest): Promise<void> {
    await randomDelay(50, 100);

    // Mock logout - just simulate delay
    // In a real app, this would invalidate the refresh token on the server
    console.log('Logged out successfully');
  },
};
