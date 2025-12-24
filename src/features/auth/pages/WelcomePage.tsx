import { useNavigate } from 'react-router-dom';
import { Mail, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const WelcomePage = () => {
  const navigate = useNavigate();

  const handleConfigureSmtp = () => {
    navigate('/settings/smtp');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Welcome to Email Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Set up your email connection to continue
          </p>
        </div>

        {/* SMTP Configuration Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Configure Email Account</CardTitle>
            <CardDescription className="text-base">
              Set up your SMTP and IMAP settings to start using the email dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-0.5 font-bold">✓</span>
                <span>Works with any email provider (Gmail, Outlook, custom servers)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-0.5 font-bold">✓</span>
                <span>Full control over IMAP/SMTP configuration</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-0.5 font-bold">✓</span>
                <span>Support for multiple email accounts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-0.5 font-bold">✓</span>
                <span>Secure connection with TLS/SSL encryption</span>
              </li>
            </ul>

            <Button
              onClick={handleConfigureSmtp}
              className="w-full"
              size="lg"
            >
              <Settings className="mr-2 h-5 w-5" />
              Configure Email Settings
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  <strong>Email setup is required.</strong> You must configure your email account
                  settings to use the email dashboard. Click the button above to get started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
