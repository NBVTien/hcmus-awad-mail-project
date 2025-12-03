import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

export const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // In backend redirect flow, auth data is passed in URL fragment (hash)
        // Format: #access_token=xxx&refresh_token=xxx&expires_at=xxx&user=...
        const hash = window.location.hash.substring(1); // Remove the '#'

        if (!hash) {
          throw new Error('No authentication data received');
        }

        // Parse URL fragment
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresAt = params.get('expires_at');
        const userDataEncoded = params.get('user');
        const errorParam = params.get('error');

        // Check for OAuth errors
        if (errorParam) {
          throw new Error(`OAuth error: ${errorParam}`);
        }

        if (!accessToken || !refreshToken || !userDataEncoded) {
          throw new Error('Missing authentication data in callback');
        }

        // Decode user data (backend encodes it as base64 JSON)
        const userData = JSON.parse(atob(userDataEncoded));

        // Construct auth response in expected format
        const authResponse = {
          user: {
            id: userData.id,
            email: userData.email,
            displayName: userData.name || userData.displayName,
            profilePicture: userData.profilePicture || null,
            authMethod: 'google' as const,
            createdAt: userData.createdAt || new Date().toISOString(),
          },
          token: {
            accessToken,
            refreshToken,
            expiresAt: expiresAt ? parseInt(expiresAt, 10) : Date.now() + 15 * 60 * 1000,
            tokenType: 'Bearer' as const,
            scope: 'email profile gmail',
          },
        };

        // Login with received tokens
        login(authResponse.user, authResponse.token);

        // Redirect to dashboard
        navigate('/inbox', { replace: true });
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'OAuth authentication failed');
      }
    };

    handleCallback();
  }, [login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <ErrorMessage message={error} onRetry={() => navigate('/login')} />
          <p className="text-center text-sm text-muted-foreground">
            Click retry to return to login page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" message="Completing authentication..." />
    </div>
  );
};
