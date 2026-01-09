import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Mail, X } from 'lucide-react';
import { emailService } from '@/services/emailService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SMTP_PROMPT_DISMISSED_KEY = 'smtp-setup-prompt-dismissed';

export const SmtpSetupPrompt = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(SMTP_PROMPT_DISMISSED_KEY) === 'true';
  });

  // Don't show prompt for Google OAuth users (they don't need SMTP config)
  const isGoogleUser = user?.authMethod === 'google';

  // Check if user has any SMTP configurations
  const { data: configs } = useQuery({
    queryKey: ['smtp-configs'],
    queryFn: () => emailService.getSmtpConfigs(),
    retry: false,
    enabled: !isGoogleUser, // Don't fetch if user is using Google OAuth
  });

  const hasConfigs = configs && configs.length > 0;

  useEffect(() => {
    // If user has configs, mark as dismissed permanently
    if (hasConfigs) {
      localStorage.setItem(SMTP_PROMPT_DISMISSED_KEY, 'true');
      setIsDismissed(true);
    }
  }, [hasConfigs]);

  const handleSetupNow = () => {
    navigate('/settings/smtp');
  };

  const handleDismiss = () => {
    localStorage.setItem(SMTP_PROMPT_DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

  // Don't show if:
  // - User is using Google OAuth (doesn't need SMTP config)
  // - User has dismissed the prompt
  // - User already has SMTP configs
  if (isGoogleUser || isDismissed || hasConfigs) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Card className="shadow-lg">
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="absolute top-2 right-2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Set Up Your Email</CardTitle>
              <CardDescription>Configure SMTP to send emails</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Optional: Add additional email accounts using custom SMTP/IMAP servers.
              You can configure Gmail, Outlook, Yahoo, or any custom provider to send and
              receive emails alongside your primary Gmail authentication.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={handleDismiss} className="flex-1">
            Maybe Later
          </Button>
          <Button onClick={handleSetupNow} className="flex-1">
            Set Up Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
