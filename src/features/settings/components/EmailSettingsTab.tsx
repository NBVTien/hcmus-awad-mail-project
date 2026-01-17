import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Check, Mail, AlertTriangle } from 'lucide-react';
import { SmtpConfigForm, type SmtpConfigFormData } from './SmtpConfigForm';
import { emailService } from '@/services/emailService';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SmtpConfig {
  id: string;
  emailAddress: string;
  displayName?: string;
  isDefault: boolean;
  createdAt: string;
}

export const EmailSettingsTab = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SmtpConfig | null>(null);
  const [deleteConfigId, setDeleteConfigId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFirstConfig, setIsFirstConfig] = useState(false);

  const { data: configs, isLoading, isError, error, refetch } = useQuery<SmtpConfig[]>({
    queryKey: ['smtp-configs'],
    queryFn: () => emailService.getSmtpConfigs(),
  });

  useEffect(() => {
    if (configs && configs.length === 0) {
      setIsFirstConfig(true);
    }
  }, [configs]);

  const createMutation = useMutation({
    mutationFn: async (data: SmtpConfigFormData) => emailService.createSmtpConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp-configs'] });
      setIsCreateDialogOpen(false);

      if (isFirstConfig) {
        setSuccessMessage('SMTP configuration created! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/inbox');
        }, 1500);
      } else {
        setSuccessMessage('SMTP configuration created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SmtpConfigFormData> }) =>
      emailService.updateSmtpConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp-configs'] });
      setEditingConfig(null);
      setSuccessMessage('SMTP configuration updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => emailService.deleteSmtpConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp-configs'] });
      setDeleteConfigId(null);
      setSuccessMessage('SMTP configuration deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => emailService.setDefaultSmtpConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp-configs'] });
      setSuccessMessage('Default account updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const handleTestConnection = async (_data: SmtpConfigFormData): Promise<boolean> => {
    try {
      if (editingConfig) {
        await emailService.testSmtpConfig(editingConfig.id);
        return true;
      }
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  };

  const handleCreate = async (data: SmtpConfigFormData) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (data: SmtpConfigFormData) => {
    if (!editingConfig) return;
    await updateMutation.mutateAsync({ id: editingConfig.id, data });
  };

  const handleDelete = async () => {
    if (!deleteConfigId) return;
    await deleteMutation.mutateAsync(deleteConfigId);
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" message="Loading email configurations..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-4">
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load email configurations'}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Account Settings</h2>
          <p className="text-muted-foreground mt-1">
            Manage your SMTP and IMAP configurations for sending and receiving emails
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* SMTP Availability Warning */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> SMTP may be unavailable.{' '}
          <a
            href="https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Learn more
          </a>
        </AlertDescription>
      </Alert>

      {/* Success Message */}
      {successMessage && (
        <Alert>
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Configurations List */}
      {configs && configs.length > 0 ? (
        <div className="space-y-4">
          {configs.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {config.displayName || config.emailAddress}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {config.emailAddress}
                        {config.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!config.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(config.id)}
                        disabled={setDefaultMutation.isPending}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingConfig(config)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfigId(config.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Added on {new Date(config.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">No email accounts configured</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Add your first email account to start sending and receiving emails through custom
              SMTP/IMAP servers
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Account
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Email Account</DialogTitle>
            <DialogDescription>
              Configure SMTP and IMAP settings for your email account
            </DialogDescription>
          </DialogHeader>
          <SmtpConfigForm
            onSubmit={handleCreate}
            onTest={handleTestConnection}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingConfig} onOpenChange={(open) => !open && setEditingConfig(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Email Account</DialogTitle>
            <DialogDescription>Update your SMTP and IMAP settings</DialogDescription>
          </DialogHeader>
          {editingConfig && (
            <SmtpConfigForm
              initialData={{
                emailAddress: editingConfig.emailAddress,
                displayName: editingConfig.displayName,
                isDefault: editingConfig.isDefault,
              }}
              onSubmit={handleUpdate}
              onTest={handleTestConnection}
              onCancel={() => setEditingConfig(null)}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfigId} onOpenChange={(open: boolean) => !open && setDeleteConfigId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this email account configuration. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
