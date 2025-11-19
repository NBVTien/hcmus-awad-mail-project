import React from 'react';
import { Reply, ReplyAll, Forward } from 'lucide-react';

type Props = {
  emailId: string;
  isStarred: boolean;
  onToggleStar: (id: string, next: boolean) => void;
  onDelete: (id: string) => void;
  onMarkUnread: (id: string) => void;
  onReply?: () => void;
  onReplyAll?: () => void;
  onForward?: () => void;
};

export const EmailActionButtons: React.FC<Props> = ({
  emailId,
  isStarred,
  onToggleStar,
  onDelete,
  onMarkUnread,
  onReply,
  onReplyAll,
  onForward,
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {onReply && (
        <button
          className="px-2 py-1 rounded bg-blue-100 text-blue-800 flex items-center gap-1"
          onClick={onReply}
          aria-label="Reply"
        >
          <Reply className="h-4 w-4" />
          Reply
        </button>
      )}

      {onReplyAll && (
        <button
          className="px-2 py-1 rounded bg-blue-100 text-blue-800 flex items-center gap-1"
          onClick={onReplyAll}
          aria-label="Reply All"
        >
          <ReplyAll className="h-4 w-4" />
          Reply All
        </button>
      )}

      {onForward && (
        <button
          className="px-2 py-1 rounded bg-indigo-100 text-indigo-800 flex items-center gap-1"
          onClick={onForward}
          aria-label="Forward"
        >
          <Forward className="h-4 w-4" />
          Forward
        </button>
      )}

      <button
        className="px-2 py-1 rounded bg-yellow-100 text-yellow-800"
        onClick={() => onToggleStar(emailId, !isStarred)}
        aria-pressed={isStarred}
      >
        {isStarred ? '★ Starred' : '☆ Star'}
      </button>

      <button
        className="px-2 py-1 rounded bg-red-100 text-red-800"
        onClick={() => onDelete(emailId)}
      >
        Delete
      </button>

      <button
        className="px-2 py-1 rounded bg-slate-100 text-slate-800"
        onClick={() => onMarkUnread(emailId)}
      >
        Mark Unread
      </button>
    </div>
  );
};
