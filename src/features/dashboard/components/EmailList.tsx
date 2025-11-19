import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import type { EmailListProps, EmailListItemProps } from './EmailList.types';
import { LoadingSpinner } from '@/components/LoadingSpinner';

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

const EmailListItem = ({
  email,
  isSelected,
  onClick,
  isChecked,
  onToggleCheck,
  showCheckbox,
}: EmailListItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 transition-colors border-l-2',
        'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected ? 'bg-accent border-primary' : 'border-transparent',
        !email.isRead && 'font-semibold'
      )}
      aria-current={isSelected ? 'true' : undefined}
    >
      <div className="flex items-start gap-3">
        {showCheckbox && onToggleCheck && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleCheck(email.id, e);
            }}
            className="pt-0.5"
          >
            <Checkbox checked={isChecked} aria-label={`Select ${email.subject}`} />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {email.isStarred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />}
              <span className="text-sm truncate">{email.from.name || email.from.email}</span>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatTimestamp(email.timestamp)}
            </span>
          </div>
          <div className="text-sm truncate">{email.subject || '(No subject)'}</div>
          <div className="text-xs text-muted-foreground truncate">{email.snippet}</div>
        </div>
      </div>
    </button>
  );
};

export const EmailList = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  isLoading,
  selectedIds,
  onToggleSelect,
  showCheckboxes = false,
}: EmailListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner message="Loading emails..." />
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <p className="text-muted-foreground">No emails in this folder</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {emails.map((email) => (
          <div key={email.id}>
            <EmailListItem
              email={email}
              isSelected={selectedEmailId === email.id}
              onClick={() => onSelectEmail(email.id)}
              isChecked={selectedIds?.has(email.id)}
              onToggleCheck={onToggleSelect}
              showCheckbox={showCheckboxes}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
