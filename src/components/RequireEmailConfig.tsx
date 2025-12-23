import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface RequireEmailConfigProps {
  children: React.ReactNode;
}

/**
 * Route guard that ensures user has email configuration (Gmail OAuth or SMTP)
 * before allowing access to email features
 */
export const RequireEmailConfig = ({ children }: RequireEmailConfigProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user has Gmail OAuth (by checking if they have OAuth tokens)
  const hasGmailOAuth = user?.authMethod === 'google';

  // Check if user has SMTP configuration
  const { data: smtpConfigs, isLoading } = useQuery({
    queryKey: ['smtp-configs'],
    queryFn: () => emailService.getSmtpConfigs(),
    enabled: !hasGmailOAuth, // Only check SMTP if not using Gmail OAuth
  });

  const hasSmtpConfig = smtpConfigs && smtpConfigs.length > 0;
  const hasEmailConfig = hasGmailOAuth || hasSmtpConfig;

  useEffect(() => {
    // If loading, don't redirect yet
    if (isLoading) return;

    // If user doesn't have any email configuration, redirect to welcome
    if (!hasEmailConfig) {
      navigate('/welcome', { replace: true });
    }
  }, [hasEmailConfig, isLoading, navigate]);

  // Show loading while checking configuration
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Checking email configuration..." />
      </div>
    );
  }

  // If no email config, don't render children (will redirect)
  if (!hasEmailConfig) {
    return null;
  }

  // User has email configuration, render the protected content
  return <>{children}</>;
};
