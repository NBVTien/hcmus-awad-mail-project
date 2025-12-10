import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCompose } from '@/features/dashboard/hooks/useCompose';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { showError } from '@/lib/toast';
import { htmlToPlainText } from '@/lib/htmlUtils';
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
import { Textarea } from '@/components/ui/textarea';

type ComposeMode = 'compose' | 'reply' | 'replyAll' | 'forward';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mode?: ComposeMode;
  originalEmail?: Email | null;
};

const composeSchema = z.object({
  to: z.string().min(1, 'At least one recipient is required'),
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

  // Generate prefill data based on mode and originalEmail
  const getPrefillData = () => {
    if (!originalEmail) {
      return { to: '', subject: '', body: '' };
    }

    switch (mode) {
      case 'reply':
        return {
          to: originalEmail.from.email,
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
          subject: originalEmail.subject.startsWith('Re:')
            ? originalEmail.subject
            : `Re: ${originalEmail.subject}`,
          body: formatReplyBody(originalEmail),
        };
      }
      case 'forward':
        return {
          to: '',
          subject: originalEmail.subject.startsWith('Fwd:')
            ? originalEmail.subject
            : `Fwd: ${originalEmail.subject}`,
          body: formatQuotedBody(originalEmail),
        };
      default:
        return { to: '', subject: '', body: '' };
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
      reset(getPrefillData());
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

      await sendEmail.mutateAsync({ to: tos, subject: data.subject, body: data.body });
      reset();
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
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              {...register('to')}
              placeholder="comma-separated emails"
              aria-invalid={!!errors.to}
            />
            {errors.to && (
              <p className="text-sm text-destructive">{errors.to.message}</p>
            )}
          </div>

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
            />
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
