import React from 'react';
import { Reply, ReplyAll, Forward, Star, Trash2, MailOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  emailId: string;
  gmailMessageId?: string;
  isStarred: boolean;
  onToggleStar: (id: string, next: boolean) => void;
  onDelete: (id: string) => void;
  onMarkUnread: (id: string) => void;
  onSnooze?: () => void;
  onReply?: () => void;
  onReplyAll?: () => void;
  onForward?: () => void;
};

export const EmailActionButtons: React.FC<Props> = ({
  emailId,
  gmailMessageId,
  isStarred,
  onToggleStar,
  onDelete,
  onMarkUnread,
  onSnooze,
  onReply,
  onReplyAll,
  onForward,
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {onReply && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReply}
          aria-label="Reply"
        >
          <Reply className="h-4 w-4" />
        </Button>
      )}

      {onReplyAll && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReplyAll}
          aria-label="Reply All"
        >
          <ReplyAll className="h-4 w-4" />
        </Button>
      )}

      {onForward && (
        <Button
          variant="outline"
          size="sm"
          onClick={onForward}
          aria-label="Forward"
        >
          <Forward className="h-4 w-4" />
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggleStar(emailId, !isStarred)}
        aria-pressed={isStarred}
        aria-label={isStarred ? 'Unstar' : 'Star'}
      >
        <Star className={`h-4 w-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
      </Button>

      {onSnooze && gmailMessageId && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSnooze}
          aria-label="Snooze"
        >
          <Clock className="h-4 w-4" />
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(emailId)}
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onMarkUnread(emailId)}
        aria-label="Mark Unread"
      >
        <MailOpen className="h-4 w-4" />
      </Button>
    </div>
  );
};
