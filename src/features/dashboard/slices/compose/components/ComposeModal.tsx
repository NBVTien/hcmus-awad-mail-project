import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCompose } from '@/features/dashboard/hooks/useCompose';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { showError } from '@/lib/toast';
import { htmlToPlainText } from '@/lib/htmlUtils';
import type { Email } from '@/types/email.types';
import { Paperclip, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

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
    ? `${email.from.name} <${email.from.email}>`
    : email.from.email;
  const date = new Date(email.timestamp).toLocaleString();
  const plainTextBody = htmlToPlainText(email.body);
  return `\n\n------- Forwarded message -------\nFrom: ${from}\nDate: ${date}\nSubject: ${email.subject}\n\n${plainTextBody}`;
};

const formatReplyBody = (email: Email): string => {
  const from = email.from.name
    ? `${email.from.name} <${email.from.email}>`
    : email.from.email;
  const date = new Date(email.timestamp).toLocaleString();
  const plainTextBody = htmlToPlainText(email.body);
  return `\n\nOn ${date}, ${from} wrote:\n> ${plainTextBody.split('\n').join('\n> ')}`;
};

export const ComposeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  mode = 'compose',
  originalEmail
}) => {
  const { sendEmail } = useCompose();
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

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
        const toRecipients = [originalEmail.from.email];
        const ccRecipients = [
          ...originalEmail.to.map((r) => r.email),
          ...(originalEmail.cc || []).map((r) => r.email),
        ].filter((email) => email !== 'user@example.com'); // Exclude self

        return {
          to: toRecipients.join(', '),
          cc: [...new Set(ccRecipients)].join(', '), // Remove duplicates
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
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(composeSchema),
    defaultValues: getPrefillData(),
  });

  useEffect(() => {
    if (isOpen) {
      const prefillData = getPrefillData();
      reset(prefillData);

      // Show CC/BCC if they have data
      if (prefillData.cc) {
        setShowCc(true);
      }
      if (prefillData.bcc) {
        setShowBcc(true);
      }

      setTimeout(() => {
        if (mode === 'forward') {
          setFocus('to');
        } else if (mode === 'compose') {
          setFocus('to');
        } else {
          setFocus('body');
        }
      }, 50);
    } else {
      // Reset when closing
      setAttachments([]);
      setShowCc(false);
      setShowBcc(false);
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

      const ccs = data.cc ? data.cc.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
      const bccs = data.bcc ? data.bcc.split(',').map((s) => s.trim()).filter(Boolean) : undefined;

      await sendEmail.mutateAsync({
        to: tos,
        cc: ccs,
        bcc: bccs,
        subject: data.subject,
        body: data.body,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      reset();
      setAttachments([]);
      setShowCc(false);
      setShowBcc(false);
      onClose();
    } catch {
      showError('Failed to send email');
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    if (isDirty && !confirm('Discard unsaved changes?')) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
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
            <Input
              id="to"
              {...register('to')}
              placeholder="recipient@example.com, another@example.com"
              aria-invalid={!!errors.to}
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
                  onClick={() => setShowCc(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Input
                id="cc"
                {...register('cc')}
                placeholder="cc@example.com"
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
                  onClick={() => setShowBcc(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Input
                id="bcc"
                {...register('bcc')}
                placeholder="bcc@example.com"
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
            <Textarea
              id="body"
              {...register('body')}
              className="min-h-[200px] resize-none"
              onKeyDown={(e) => {
                // Prevent form submit on Enter, allow new line
                if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                  e.stopPropagation();
                }
              }}
            />
          </div>

          {/* Attachments Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="attachments">Attachments</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-input')?.click()}
                className="h-7 gap-2"
              >
                <Paperclip className="h-3 w-3" />
                Add files
              </Button>
              <input
                id="file-input"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setAttachments([...attachments, ...Array.from(e.target.files)]);
                  }
                }}
              />
            </div>
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <Badge key={index} variant="secondary" className="gap-2">
                    <Paperclip className="h-3 w-3" />
                    {file.name}
                    <button
                      type="button"
                      onClick={() => {
                        setAttachments(attachments.filter((_, i) => i !== index));
                      }}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
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
