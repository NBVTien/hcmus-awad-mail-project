import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCompose } from '@/features/dashboard/hooks/useCompose';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { showError } from '@/lib/toast';
import type { Email } from '@/types/email.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { EmailInput } from '@/components/ui/email-input';
import { Paperclip, X } from 'lucide-react';

type ComposeMode = 'compose' | 'reply' | 'replyAll' | 'forward';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mode?: ComposeMode;
  originalEmail?: Email | null;
};

const composeSchema = z.object({
  to: z.string().min(1, 'At least one recipient is required'),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().optional(),
});

type FormValues = z.infer<typeof composeSchema>;

const formatQuotedBody = (email: Email): string => {
  const from = email.from.name
    ? `${email.from.name} &lt;${email.from.email}&gt;`
    : email.from.email;
  const date = new Date(email.timestamp).toLocaleString();
  return `<p><br></p><p><br></p><hr><p><strong>Forwarded message</strong></p><p><strong>From:</strong> ${from}</p><p><strong>Date:</strong> ${date}</p><p><strong>Subject:</strong> ${email.subject}</p><p><br></p>${email.body}`;
};

const formatReplyBody = (email: Email): string => {
  const from = email.from.name
    ? `${email.from.name} &lt;${email.from.email}&gt;`
    : email.from.email;
  const date = new Date(email.timestamp).toLocaleString();
  return `<p><br></p><p><br></p><p>On ${date}, ${from} wrote:</p><blockquote>${email.body}</blockquote>`;
};

export const ComposeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  mode = 'compose',
  originalEmail
}) => {
  const { sendEmail } = useCompose();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  // Generate prefill data based on mode and originalEmail
  const getPrefillData = () => {
    if (!originalEmail) {
      return { to: '', cc: '', bcc: '', subject: '', body: '' };
    }

    switch (mode) {
      case 'reply':
        return {
          to: originalEmail.from.email,
          cc: '',
          bcc: '',
          subject: originalEmail.subject.startsWith('Re:')
            ? originalEmail.subject
            : `Re: ${originalEmail.subject}`,
          body: formatReplyBody(originalEmail),
        };
      case 'replyAll': {
        const recipients = [
          originalEmail.from.email,
          ...originalEmail.to.map((r) => r.email),
          ...(originalEmail.cc || []).map((r) => r.email),
        ].filter((email) => email !== 'user@example.com'); // Exclude self
        return {
          to: [...new Set(recipients)].join(', '), // Remove duplicates
          cc: '',
          bcc: '',
          subject: originalEmail.subject.startsWith('Re:')
            ? originalEmail.subject
            : `Re: ${originalEmail.subject}`,
          body: formatReplyBody(originalEmail),
        };
      }
      case 'forward':
        return {
          to: '',
          cc: '',
          bcc: '',
          subject: originalEmail.subject.startsWith('Fwd:')
            ? originalEmail.subject
            : `Fwd: ${originalEmail.subject}`,
          body: formatQuotedBody(originalEmail),
        };
      default:
        return { to: '', cc: '', bcc: '', subject: '', body: '' };
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    control,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(composeSchema),
    defaultValues: getPrefillData(),
  });

  useEffect(() => {
    if (isOpen) {
      reset(getPrefillData());
      setAttachments([]);
      setShowCc(false);
      setShowBcc(false);
      setTimeout(() => {
        if (mode === 'forward') {
          setFocus('to');
        } else if (mode === 'compose') {
          setFocus('to');
        } else {
          setFocus('body');
        }
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, originalEmail, reset, setFocus]);

  const onSubmit = async (data: FormValues) => {
    try {
      const tos = data.to.split(',').map((s) => s.trim()).filter(Boolean);
      if (tos.length === 0) {
        showError('Please provide at least one recipient');
        return;
      }

      const ccs = data.cc ? data.cc.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const bccs = data.bcc ? data.bcc.split(',').map((s) => s.trim()).filter(Boolean) : [];

      await sendEmail.mutateAsync({
        to: tos,
        cc: ccs,
        bcc: bccs,
        subject: data.subject,
        body: data.body,
        attachments
      });
      reset();
      setAttachments([]);
      onClose();
    } catch {
      showError('Failed to send email');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleClose = () => {
    if (isSubmitting) return;
    if (isDirty && !confirm('Discard unsaved changes?')) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'reply' && 'Reply'}
            {mode === 'replyAll' && 'Reply All'}
            {mode === 'forward' && 'Forward'}
            {mode === 'compose' && 'Compose'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="to">To</Label>
              <div className="flex gap-2">
                {!showCc && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCc(true)}
                    className="h-7 text-xs"
                  >
                    Cc
                  </Button>
                )}
                {!showBcc && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBcc(true)}
                    className="h-7 text-xs"
                  >
                    Bcc
                  </Button>
                )}
              </div>
            </div>
            <Controller
              name="to"
              control={control}
              render={({ field }) => (
                <EmailInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter email addresses"
                  className={errors.to ? 'border-destructive' : ''}
                />
              )}
            />
            {errors.to && (
              <p className="text-sm text-destructive">{errors.to.message}</p>
            )}
          </div>

          {showCc && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cc">Cc</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCc(false);
                    setValue('cc', '');
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Controller
                name="cc"
                control={control}
                render={({ field }) => (
                  <EmailInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Enter email addresses"
                  />
                )}
              />
            </div>
          )}

          {showBcc && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bcc">Bcc</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowBcc(false);
                    setValue('bcc', '');
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Controller
                name="bcc"
                control={control}
                render={({ field }) => (
                  <EmailInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Enter email addresses"
                  />
                )}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              {...register('subject')}
              aria-invalid={!!errors.subject}
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Controller
              name="body"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  content={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Write your message..."
                />
              )}
            />
          </div>

          {/* Attachments Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Attachments</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-input')?.click()}
                className="gap-2"
              >
                <Paperclip className="h-4 w-4" />
                Add Attachment
              </Button>
              <input
                id="file-input"
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            {attachments.length > 0 && (
              <div className="space-y-2 mt-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Paperclip className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-muted-foreground flex-shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="h-6 w-6 p-0 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
