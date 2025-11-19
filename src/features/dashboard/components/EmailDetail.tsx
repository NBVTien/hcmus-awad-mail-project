import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { EmailDetailProps } from './EmailDetail.types';
import { LoadingSpinner } from '@/components/LoadingSpinner';

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

export const EmailDetail = ({ email, isLoading }: EmailDetailProps) => {
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
    <ScrollArea className="h-full">
      <div className="p-6 space-y-4">
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

            <div className="flex items-start gap-2">
              <span className="text-muted-foreground min-w-16">Date:</span>
              <span>{formatFullTimestamp(email.timestamp)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Email Body */}
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {email.body}
          </pre>
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
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatFileSize(attachment.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
};
