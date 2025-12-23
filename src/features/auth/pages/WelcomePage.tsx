import { useNavigate } from 'react-router-dom';
import { Mail, Settings, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const WelcomePage = () => {
  const navigate = useNavigate();

  const handleConnectGmail = () => {
    // Redirect to OAuth login
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  };

  const handleConfigureSmtp = () => {
    navigate('/settings/smtp');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Welcome to Email Dashboard! 🎉</h1>
          <p className="text-muted-foreground text-lg">
            Set up your email connection to continue
          </p>
        </div>

        {/* Connection Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gmail OAuth Option */}
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Chrome className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Connect Gmail</CardTitle>
              </div>
              <CardDescription className="text-base">
                Quick and secure OAuth connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>One-click setup with Google OAuth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Automatic email sync</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Full Gmail integration (labels, search)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Recommended for Gmail users</span>
                </li>
              </ul>
              <Button onClick={handleConnectGmail} className="w-full" size="lg">
                <Chrome className="mr-2 h-5 w-5" />
                Connect Gmail
              </Button>
            </CardContent>
          </Card>

          {/* SMTP Configuration Option */}
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16" />
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl">Configure SMTP</CardTitle>
              </div>
              <CardDescription className="text-base">
                Use custom email provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Works with any email provider</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Configure IMAP/SMTP settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Support for multiple accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>More control over configuration</span>
                </li>
              </ul>
              <Button
                onClick={handleConfigureSmtp}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                <Settings className="mr-2 h-5 w-5" />
                Configure SMTP
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  <strong>Email setup is required.</strong> You must connect an email account
                  (Gmail OAuth or SMTP) to use the email dashboard. Choose an option above to continue.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
