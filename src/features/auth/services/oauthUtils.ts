// Generate a cryptographically secure random string for PKCE
export const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

// Generate a random state parameter for CSRF protection
export const generateState = (): string => {
  return crypto.randomUUID();
};

// Simple code challenge for demo (in production, use SHA-256 hash)
export const generateCodeChallenge = (verifier: string): string => {
  // For demo purposes, we'll use base64 encoding
  // In production, use: base64url(SHA256(verifier))
  return btoa(verifier).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

// Build Google OAuth authorization URL
export const buildAuthorizationUrl = (params: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string => {
  const { clientId, redirectUri, state, codeChallenge } = params;

  const authParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;
};

// Store OAuth state in sessionStorage
export const storeOAuthState = (state: string, codeVerifier: string): void => {
  sessionStorage.setItem('oauth_state', state);
  sessionStorage.setItem('oauth_code_verifier', codeVerifier);
};

// Retrieve and validate OAuth state from sessionStorage
export const validateOAuthState = (receivedState: string): {
  isValid: boolean;
  codeVerifier: string | null;
} => {
  const storedState = sessionStorage.getItem('oauth_state');
  const codeVerifier = sessionStorage.getItem('oauth_code_verifier');

  // Clear stored state
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('oauth_code_verifier');

  if (!storedState || !codeVerifier) {
    return { isValid: false, codeVerifier: null };
  }

  if (storedState !== receivedState) {
    return { isValid: false, codeVerifier: null };
  }

  return { isValid: true, codeVerifier };
};
