/**
 * TODO: For production, consider implementing list virtualization for large mailboxes (1000+ emails)
 * Recommended: react-window or @tanstack/react-virtual
 * See: IMPLEMENTATION_TIPS.md Section 3
 */
// import { ScrollArea } from '@/components/ui/scroll-area';
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
    <div
      className={cn(
        'w-full max-w-full min-w-0 text-left pl-3.5 pr-4 py-3 transition-colors border-l-2 cursor-pointer',
        'hover:bg-accent',
        isSelected ? 'bg-accent border-primary' : 'border-transparent',
        !email.isRead && 'font-semibold'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-current={isSelected ? 'true' : undefined}
    >
      <div className="flex items-start gap-3 min-w-0 max-w-full">
        {showCheckbox && onToggleCheck && (
          <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleCheck(email.id, e);
              }}
            >
              <Checkbox checked={isChecked} aria-label={`Select ${email.subject}`} />
            </div>
            {!email.isRead && (
              <div className="w-2 h-2 rounded-full bg-blue-500" aria-label="Unread" />
            )}
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
              {email.isStarred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0" />}
              <span className="text-sm truncate block">{email.from.name || email.from.email}</span>
            </div>
            <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
              {formatTimestamp(email.timestamp)}
            </span>
          </div>
          <div className="text-sm truncate">{email.subject || '(No subject)'}</div>
          <div className="text-xs text-muted-foreground truncate">{email.snippet}</div>
        </div>
      </div>
    </div>
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
    <div className="h-full w-full overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col w-full min-w-0 divide-y">
        {emails.map((email) => (
          <EmailListItem
            key={email.id}
            email={email}
            isSelected={selectedEmailId === email.id}
            onClick={() => onSelectEmail(email.id)}
            isChecked={selectedIds?.has(email.id)}
            onToggleCheck={onToggleSelect}
            showCheckbox={showCheckboxes}
          />
        ))}
      </div>
    </div>
  );
};
