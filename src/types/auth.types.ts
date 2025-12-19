export type AuthMethod = 'email' | 'google';

export interface User {
  id: string;
  email: string;
  displayName: string;
  profilePicture: string | null;
  authMethod: AuthMethod;
  createdAt: string; // ISO 8601
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
  tokenType: 'Bearer';
  scope?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: AuthToken;
}

export interface RegisterResponse {
  user: User;
  token: AuthToken;
}

export interface GoogleAuthRequest {
  redirectUri: string;
}

export interface GoogleAuthResponse {
  authorizationUrl: string;
  state: string;
  codeVerifier: string;
}

export interface GoogleCallbackRequest {
  code: string;
  state: string;
  codeVerifier: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresAt: number;
  tokenType: 'Bearer';
}

export interface LogoutRequest {
  refreshToken: string;
}
