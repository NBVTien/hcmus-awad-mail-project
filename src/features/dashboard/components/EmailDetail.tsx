import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { EmailDetailProps } from './EmailDetail.types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmailActionButtons } from './EmailActionButtons';
import { SnoozeDialog } from './SnoozeDialog';
import { useEmailActions } from '../hooks/useEmailActions';
import { useEffect, useRef, useState } from 'react';
import { EmailBodyRenderer } from './EmailBodyRenderer';

const formatFullTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const EmailDetail = ({
  email,
  isLoading,
  onDeleteSuccess,
  onReply,
  onReplyAll,
  onForward,
}: EmailDetailProps) => {
  const { toggleStar, toggleRead, deleteEmail } = useEmailActions();
  const markAsReadTimerRef = useRef<number | null>(null);
  const markedEmailsRef = useRef<Set<string>>(new Set());
  const [snoozeDialogOpen, setSnoozeDialogOpen] = useState(false);
  const [emailToSnooze, setEmailToSnooze] = useState<{ id: string; gmailMessageId: string } | null>(
    null
  );

  // Auto-mark email as read after viewing for a few seconds
  useEffect(() => {
    // Clear any existing timer
    if (markAsReadTimerRef.current) {
      clearTimeout(markAsReadTimerRef.current);
      markAsReadTimerRef.current = null;
    }

    // If email is loaded, unread, and hasn't been marked yet
    if (email && !email.isRead && !markedEmailsRef.current.has(email.id)) {
      markAsReadTimerRef.current = setTimeout(() => {
        toggleRead.mutate({ emailId: email.id, isRead: true });
        markedEmailsRef.current.add(email.id);
      }, 3000); // Mark as read after 3 seconds
    }

    // Cleanup timer on unmount or when email changes
    return () => {
      if (markAsReadTimerRef.current) {
        clearTimeout(markAsReadTimerRef.current);
        markAsReadTimerRef.current = null;
      }
    };
  }, [email, toggleRead]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner message="Loading email..." />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <p className="text-muted-foreground">Select an email to view its contents</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-6 space-y-4">
        {/* Action buttons */}
        {email && (
          <div className="flex items-center justify-end">
            <EmailActionButtons
              emailId={email.id}
              gmailMessageId={email.id}
              isStarred={!!email.isStarred}
              onToggleStar={(id, next) => toggleStar.mutate({ emailId: id, isStarred: next })}
              onDelete={(id) =>
                deleteEmail.mutate(id, {
                  onSuccess: () => {
                    // Notify parent to update selection/navigation
                    if (onDeleteSuccess) {
                      onDeleteSuccess();
                    }
                  },
                })
              }
              onMarkUnread={(id) => {
                toggleRead.mutate({ emailId: id, isRead: false });
              }}
              onSnooze={() => {
                setEmailToSnooze({ id: email.id, gmailMessageId: email.id });
                setSnoozeDialogOpen(true);
              }}
              onReply={onReply}
              onReplyAll={onReplyAll}
              onForward={onForward}
            />
          </div>
        )}
        {/* Email Header */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold">{email.subject || '(No subject)'}</h1>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground min-w-16">From:</span>
              <span>
                {email.from.name && <strong>{email.from.name}</strong>}{' '}
                <span className="text-muted-foreground">&lt;{email.from.email}&gt;</span>
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-muted-foreground min-w-16">To:</span>
              <span>
                {email.to.map((recipient, index) => (
                  <span key={index}>
                    {index > 0 && ', '}
                    {recipient.name && <strong>{recipient.name}</strong>}{' '}
                    <span className="text-muted-foreground">&lt;{recipient.email}&gt;</span>
                  </span>
                ))}
              </span>
            </div>

            {email.cc && email.cc.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-16">CC:</span>
                <span>
                  {email.cc.map((recipient, index) => (
                    <span key={index}>
                      {index > 0 && ', '}
                      {recipient.name && <strong>{recipient.name}</strong>}{' '}
                      <span className="text-muted-foreground">&lt;{recipient.email}&gt;</span>
                    </span>
                  ))}
                </span>
              </div>
            )}

            <div className="flex items-start gap-2">
              <span className="text-muted-foreground min-w-16">Date:</span>
              <span>{formatFullTimestamp(email.timestamp)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Email Body */}
        <div className="max-w-none">
          <EmailBodyRenderer body={email.body} />
        </div>

        {/* Attachments */}
        {email.hasAttachments && email.attachments && email.attachments.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                Attachments ({email.attachments.length})
              </h3>
              <div className="space-y-2">
                {email.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 rounded-md border bg-muted/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm truncate">{attachment.filename}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatFileSize(attachment.size)}
                      </span>
                      <button
                        onClick={() => {
                          // Mock download functionality
                          const link = document.createElement('a');
                          link.href = attachment.url || '#';
                          link.download = attachment.filename;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-2 py-1 text-xs rounded bg-primary text-white hover:bg-primary/90"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Snooze Dialog */}
      {emailToSnooze && (
        <SnoozeDialog
          isOpen={snoozeDialogOpen}
          onClose={() => {
            setSnoozeDialogOpen(false);
            setEmailToSnooze(null);
          }}
          emailId={emailToSnooze.id}
          gmailMessageId={emailToSnooze.gmailMessageId}
          onSnoozeSuccess={() => {
            setSnoozeDialogOpen(false);
            setEmailToSnooze(null);
            // Optionally close the email detail or navigate away
            if (onDeleteSuccess) {
              onDeleteSuccess();
            }
          }}
        />
      )}
    </ScrollArea>
  );
};
