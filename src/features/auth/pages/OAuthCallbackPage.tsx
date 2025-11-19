import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockAuthService } from '@/services/mockAuthService';
import { validateOAuthState } from '../services/oauthUtils';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

export const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract code and state from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');

        // Check for OAuth errors
        if (errorParam) {
          throw new Error(`OAuth error: ${errorParam}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Validate state and retrieve code verifier
        const { isValid, codeVerifier } = validateOAuthState(state);

        if (!isValid || !codeVerifier) {
          throw new Error('Invalid or expired OAuth state (CSRF protection)');
        }

        // Exchange code for tokens
        const response = await mockAuthService.handleGoogleCallback({
          code,
          state,
          codeVerifier,
        });

        // Login with received tokens
        login(response.user, response.token);

        // Redirect to dashboard
        navigate('/inbox', { replace: true });
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'OAuth authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

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
