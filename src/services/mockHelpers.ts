import { ApiError } from '@/lib/apiClient';

// Simulate network delay
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Random delay between min and max milliseconds
export const randomDelay = (min: number = 200, max: number = 500): Promise<void> => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate mock JWT token
export const generateMockToken = (): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: 'user-id',
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
      iat: Math.floor(Date.now() / 1000),
    })
  );
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

// Generate mock user
export const generateMockUser = (email: string, authMethod: 'email' | 'google') => {
  const name = email.split('@')[0];
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  return {
    id: crypto.randomUUID(),
    email,
    displayName,
    profilePicture: authMethod === 'google' ? 'https://via.placeholder.com/150' : null,
    authMethod,
    createdAt: new Date().toISOString(),
  };
};

// Generate mock tokens
export const generateMockTokens = () => {
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

  return {
    accessToken: generateMockToken(),
    refreshToken: generateMockToken(),
    expiresAt,
    tokenType: 'Bearer' as const,
    scope: 'read:emails read:profile',
  };
};

// Throw API error
export const throwApiError = (code: string, message: string, statusCode: number): never => {
  throw new ApiError(code, message, statusCode);
};
