import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCompose } from '@/features/dashboard/hooks/useCompose';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { showError } from '@/lib/toast';
import { htmlToPlainText } from '@/lib/htmlUtils';
import type { Email } from '@/types/email.types';

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

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={() => {
        if (isSubmitting) return;
        if (isDirty) {
          if (!confirm('Discard unsaved changes?')) return;
        }
        onClose();
      }} />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 z-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {mode === 'reply' && 'Reply'}
            {mode === 'replyAll' && 'Reply All'}
            {mode === 'forward' && 'Forward'}
            {mode === 'compose' && 'Compose'}
          </h2>
          <button
            type="button"
            onClick={() => {
              if (isSubmitting) return;
              if (isDirty && !confirm('Discard unsaved changes?')) return;
              onClose();
            }}
            className="text-sm text-muted-foreground"
          >
            Close
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm">To</label>
            <input
              {...register('to')}
              className="w-full border rounded px-2 py-1"
              placeholder="comma-separated emails"
            />
            {errors.to && <p className="text-sm text-red-600">{errors.to.message}</p>}
          </div>

          <div>
            <label className="text-sm">Subject</label>
            <input {...register('subject')} className="w-full border rounded px-2 py-1" />
            {errors.subject && <p className="text-sm text-red-600">{errors.subject.message}</p>}
          </div>

          <div>
            <label className="text-sm">Message</label>
            <textarea {...register('body')} className="w-full border rounded px-2 py-1 h-40" />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (isSubmitting) return;
                if (isDirty && !confirm('Discard unsaved changes?')) return;
                onClose();
              }}
              className="px-3 py-1 rounded bg-slate-100 text-slate-800"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-3 py-1 rounded bg-primary text-white">
              {isSubmitting ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
