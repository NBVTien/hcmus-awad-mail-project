import { Button } from '@/components/ui/button';
import type { OAuthButtonProps } from './OAuthButton.types';

export const OAuthButton = ({ onError }: OAuthButtonProps) => {
  const handleOAuthLogin = async () => {
    try {
      // Get the callback URL where backend will redirect after OAuth
      const redirectUri =
        import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`;

      // Call backend to get Gmail OAuth URL
      const { authService } = await import('@/services/authService');
      const { authorizationUrl } = await authService.initiateGoogleAuth({
        redirectUri,
      });

      // Redirect to Google OAuth (via backend's URL)
      window.location.href = authorizationUrl;
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('OAuth initialization failed'));
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleOAuthLogin}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Sign in with Google
    </Button>
  );
};
