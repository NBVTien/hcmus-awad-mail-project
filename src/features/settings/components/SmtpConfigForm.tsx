import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const smtpConfigSchema = z.object({
  emailAddress: z.string().email('Invalid email address'),
  displayName: z.string().optional(),
  imapHost: z.string().min(1, 'IMAP host is required'),
  imapPort: z.number().int().min(1).max(65535),
  imapSecure: z.boolean(),
  imapUsername: z.string().min(1, 'IMAP username is required'),
  imapPassword: z.string().min(1, 'IMAP password is required'),
  smtpHost: z.string().min(1, 'SMTP host is required'),
  smtpPort: z.number().int().min(1).max(65535),
  smtpSecure: z.boolean(),
  smtpUsername: z.string().min(1, 'SMTP username is required'),
  smtpPassword: z.string().min(1, 'SMTP password is required'),
  isDefault: z.boolean(),
});

export type SmtpConfigFormData = {
  emailAddress: string;
  displayName?: string;
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
  imapUsername: string;
  imapPassword: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUsername: string;
  smtpPassword: string;
  isDefault: boolean;
};

interface SmtpConfigFormProps {
  initialData?: Partial<SmtpConfigFormData>;
  onSubmit: (data: SmtpConfigFormData) => Promise<void>;
  onTest?: (data: SmtpConfigFormData) => Promise<boolean>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const SmtpConfigForm = ({
  initialData,
  onSubmit,
  onTest,
  onCancel,
  isLoading = false,
}: SmtpConfigFormProps) => {
  const [showImapPassword, setShowImapPassword] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useForm<SmtpConfigFormData>({
    resolver: zodResolver(smtpConfigSchema),
    defaultValues: {
      emailAddress: initialData?.emailAddress || '',
      displayName: initialData?.displayName || '',
      imapHost: initialData?.imapHost || '',
      imapPort: initialData?.imapPort || 993,
      imapSecure: initialData?.imapSecure !== undefined ? initialData.imapSecure : true,
      imapUsername: initialData?.imapUsername || '',
      imapPassword: initialData?.imapPassword || '',
      smtpHost: initialData?.smtpHost || '',
      smtpPort: initialData?.smtpPort || 587,
      smtpSecure: initialData?.smtpSecure !== undefined ? initialData.smtpSecure : true,
      smtpUsername: initialData?.smtpUsername || '',
      smtpPassword: initialData?.smtpPassword || '',
      isDefault: initialData?.isDefault || false,
    },
  });

  const handleTestConnection = async () => {
    if (!onTest) return;

    setTestStatus('testing');
    setTestError(null);

    try {
      const formData = getValues();
      const success = await onTest(formData);

      if (success) {
        setTestStatus('success');
        setTimeout(() => setTestStatus('idle'), 3000);
      } else {
        setTestStatus('error');
        setTestError('Connection test failed');
      }
    } catch (error) {
      setTestStatus('error');
      setTestError(error instanceof Error ? error.message : 'Connection test failed');
    }
  };

  const onFormSubmit = async (data: SmtpConfigFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Email Account Configuration</CardTitle>
          <CardDescription>
            Configure your SMTP and IMAP settings to send and receive emails
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Account Information</h3>

            <div className="space-y-2">
              <Label htmlFor="emailAddress">Email Address *</Label>
              <Input
                id="emailAddress"
                type="email"
                placeholder="your.email@example.com"
                {...register('emailAddress')}
              />
              {errors.emailAddress && (
                <p className="text-sm text-destructive">{errors.emailAddress.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your Name"
                {...register('displayName')}
              />
            </div>
          </div>

          {/* IMAP Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold">IMAP Settings (Incoming Mail)</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imapHost">IMAP Host *</Label>
                <Input
                  id="imapHost"
                  type="text"
                  placeholder="imap.gmail.com"
                  {...register('imapHost')}
                />
                {errors.imapHost && (
                  <p className="text-sm text-destructive">{errors.imapHost.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imapPort">IMAP Port *</Label>
                <Input
                  id="imapPort"
                  type="number"
                  placeholder="993"
                  {...register('imapPort', { valueAsNumber: true })}
                />
                {errors.imapPort && (
                  <p className="text-sm text-destructive">{errors.imapPort.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imapUsername">IMAP Username *</Label>
              <Input
                id="imapUsername"
                type="text"
                placeholder="your.email@example.com"
                {...register('imapUsername')}
              />
              {errors.imapUsername && (
                <p className="text-sm text-destructive">{errors.imapUsername.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imapPassword">IMAP Password *</Label>
              <div className="relative">
                <Input
                  id="imapPassword"
                  type={showImapPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('imapPassword')}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImapPassword(!showImapPassword)}
                  className="absolute right-0 top-0 h-full px-3"
                >
                  {showImapPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.imapPassword && (
                <p className="text-sm text-destructive">{errors.imapPassword.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="imapSecure"
                checked={watch('imapSecure')}
                onCheckedChange={(checked) => setValue('imapSecure', checked as boolean)}
              />
              <Label htmlFor="imapSecure" className="text-sm font-normal">
                Use TLS/SSL (recommended)
              </Label>
            </div>
          </div>

          {/* SMTP Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold">SMTP Settings (Outgoing Mail)</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host *</Label>
                <Input
                  id="smtpHost"
                  type="text"
                  placeholder="smtp.gmail.com"
                  {...register('smtpHost')}
                />
                {errors.smtpHost && (
                  <p className="text-sm text-destructive">{errors.smtpHost.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port *</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  placeholder="587"
                  {...register('smtpPort', { valueAsNumber: true })}
                />
                {errors.smtpPort && (
                  <p className="text-sm text-destructive">{errors.smtpPort.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpUsername">SMTP Username *</Label>
              <Input
                id="smtpUsername"
                type="text"
                placeholder="your.email@example.com"
                {...register('smtpUsername')}
              />
              {errors.smtpUsername && (
                <p className="text-sm text-destructive">{errors.smtpUsername.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP Password *</Label>
              <div className="relative">
                <Input
                  id="smtpPassword"
                  type={showSmtpPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('smtpPassword')}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                  className="absolute right-0 top-0 h-full px-3"
                >
                  {showSmtpPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.smtpPassword && (
                <p className="text-sm text-destructive">{errors.smtpPassword.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="smtpSecure"
                checked={watch('smtpSecure')}
                onCheckedChange={(checked) => setValue('smtpSecure', checked as boolean)}
              />
              <Label htmlFor="smtpSecure" className="text-sm font-normal">
                Use TLS/SSL (recommended)
              </Label>
            </div>
          </div>

          {/* Default Account */}
          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="isDefault"
              checked={watch('isDefault')}
              onCheckedChange={(checked) => setValue('isDefault', checked as boolean)}
            />
            <Label htmlFor="isDefault" className="text-sm font-normal">
              Set as default account
            </Label>
          </div>

          {/* Test Connection Result */}
          {testStatus !== 'idle' && (
            <Alert variant={testStatus === 'success' ? 'default' : 'destructive'}>
              <div className="flex items-center gap-2">
                {testStatus === 'testing' && <Loader2 className="h-4 w-4 animate-spin" />}
                {testStatus === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                {testStatus === 'error' && <XCircle className="h-4 w-4" />}
                <AlertDescription>
                  {testStatus === 'testing' && 'Testing connection...'}
                  {testStatus === 'success' && 'Connection successful!'}
                  {testStatus === 'error' && (testError || 'Connection failed')}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-between gap-2">
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {onTest && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleTestConnection}
                disabled={isLoading || testStatus === 'testing'}
              >
                {testStatus === 'testing' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
};
