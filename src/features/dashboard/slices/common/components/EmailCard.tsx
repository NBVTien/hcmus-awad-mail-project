import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Star, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EmailCardProps } from './EmailCard.types';

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (days < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

export const EmailCard = ({ email, isSelected, onClick }: EmailCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: email.id,
    data: { email },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        'p-3 bg-card border rounded-lg shadow-sm transition-all cursor-pointer mb-2',
        'hover:shadow-md',
        isSelected && 'ring-2 ring-primary bg-accent',
        isDragging && 'opacity-50',
        !email.isRead && 'border-l-4 border-l-blue-500'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1 min-w-0">
          {!email.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
          {email.isStarred && (
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
          )}
        </div>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {formatTimestamp(email.timestamp)}
        </span>
      </div>

      <div className="space-y-1">
        <div className="text-sm font-medium truncate">
          {email.from.name || email.from.email}
        </div>
        <div className={cn('text-sm truncate', !email.isRead && 'font-semibold')}>
          {email.subject || '(No subject)'}
        </div>
        <div className="text-xs text-muted-foreground line-clamp-2">{email.snippet}</div>
      </div>

      {email.hasAttachments && (
        <div className="flex items-center gap-1 mt-2 text-muted-foreground">
          <Paperclip className="h-3 w-3" />
          <span className="text-xs">Attachment</span>
        </div>
      )}
    </div>
  );
};
