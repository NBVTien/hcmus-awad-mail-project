import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { FolderListProps, FolderItemProps } from './FolderList.types';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const FolderItem = ({ mailbox, isSelected, onClick }: FolderItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between px-4 py-3 text-sm transition-colors',
        'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected && 'bg-accent font-medium'
      )}
      aria-current={isSelected ? 'page' : undefined}
    >
      <span className="flex items-center gap-2">
        <span>{mailbox.name}</span>
      </span>
      {mailbox.unreadCount > 0 && (
        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
          {mailbox.unreadCount}
        </span>
      )}
    </button>
  );
};

export const FolderList = ({
  mailboxes,
  selectedMailboxId,
  onSelectMailbox,
  isLoading,
}: FolderListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner message="Loading folders..." />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <nav aria-label="Mailbox folders" className="py-2">
        {mailboxes.map((mailbox) => (
          <FolderItem
            key={mailbox.id}
            mailbox={mailbox}
            isSelected={selectedMailboxId === mailbox.id}
            onClick={() => onSelectMailbox(mailbox.id)}
          />
        ))}
      </nav>
    </ScrollArea>
  );
};
