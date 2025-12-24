import { useNavigate } from 'react-router-dom';
import { Mail, Settings, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const NoEmailConfigured = () => {
  const navigate = useNavigate();

  const handleConfigureSmtp = () => {
    navigate('/settings/smtp');
  };

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">No Email Account Connected</h2>
          <p className="text-muted-foreground">
            Configure your email account to start managing your inbox
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to configure your SMTP/IMAP settings before you can view and manage emails.
          </AlertDescription>
        </Alert>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle>Configure Email Account</CardTitle>
            <CardDescription>Set up your SMTP and IMAP settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConfigureSmtp} className="w-full" size="lg">
              <Settings className="mr-2 h-5 w-5" />
              Configure Email Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
