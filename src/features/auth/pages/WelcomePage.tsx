import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Settings, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/services/authService';

export const WelcomePage = () => {
  const navigate = useNavigate();
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectGmail = async () => {
    try {
      setIsConnectingGmail(true);
      setError(null);

      const redirectUri = `${window.location.origin}`;
      const { authorizationUrl } = await authService.initiateGoogleAuth({ redirectUri });

      window.location.href = authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate Gmail connection');
      setIsConnectingGmail(false);
    }
  };

  const handleConfigureSmtp = () => {
    navigate('/settings/smtp');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Welcome to Email Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Connect your Gmail account to continue
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="relative overflow-hidden border-2 border-primary/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Connect with Gmail</CardTitle>
            <CardDescription className="text-base">
              Required: Authenticate with your Gmail account to use the email dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-0.5 font-bold">✓</span>
                <span>Secure OAuth 2.0 authentication</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-0.5 font-bold">✓</span>
                <span>Access your Gmail inbox and send emails</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-0.5 font-bold">✓</span>
                <span>No password storage required</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-0.5 font-bold">✓</span>
                <span>Can be revoked anytime from your Google account</span>
              </li>
            </ul>

            <Button
              onClick={handleConnectGmail}
              className="w-full"
              size="lg"
              disabled={isConnectingGmail}
            >
              {isConnectingGmail ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Connecting...
                </>
              ) : (
                <>
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
                  Connect with Gmail
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Optional: Configure additional email accounts
            </span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Settings className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-xl">Custom SMTP/IMAP Settings</CardTitle>
            <CardDescription>
              After connecting Gmail, you can optionally add other email accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Once you've connected your Gmail account, you'll be able to configure
              additional email providers like Outlook, Yahoo, or custom SMTP/IMAP servers.
            </p>
            <Button
              onClick={handleConfigureSmtp}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Settings className="mr-2 h-5 w-5" />
              Configure SMTP Settings
            </Button>
          </CardContent>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Why Gmail is required:</strong> Gmail authentication is currently required
            to initialize your account. After connecting, you can choose to use SMTP/IMAP for
            other email providers while keeping Gmail as your authentication method.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
