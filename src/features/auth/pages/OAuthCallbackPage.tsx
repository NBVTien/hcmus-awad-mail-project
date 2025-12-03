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
        // Check for error in query params
        const urlParams = new URLSearchParams(window.location.search);
        const authStatus = urlParams.get('auth');
        const errorMessage = urlParams.get('message');

        if (authStatus === 'error') {
          throw new Error(errorMessage || 'OAuth authentication failed');
        }

        // Backend redirects with auth data in URL fragment (hash)
        // Format: #<URL-encoded JSON>
        const hash = window.location.hash.substring(1); // Remove the '#'

        if (!hash) {
          throw new Error('No authentication data received');
        }

        // Decode the JSON data from the hash
        const decodedData = decodeURIComponent(hash);
        const authData = JSON.parse(decodedData);

        // Validate received data
        if (!authData.accessToken || !authData.refreshToken || !authData.user) {
          throw new Error('Missing authentication data in callback');
        }

        // Construct auth response in expected format
        const authResponse = {
          user: {
            id: authData.user.id,
            email: authData.user.email,
            displayName: authData.user.name,
            profilePicture: null,
            authMethod: 'google' as const,
            createdAt: new Date().toISOString(),
          },
          token: {
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes default
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
