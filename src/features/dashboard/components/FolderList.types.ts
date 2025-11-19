import type { Mailbox } from '@/types/email.types';

export interface FolderListProps {
  mailboxes: Mailbox[];
  selectedMailboxId: string | null;
  onSelectMailbox: (mailboxId: string) => void;
  isLoading?: boolean;
}

export interface FolderItemProps {
  mailbox: Mailbox;
  isSelected: boolean;
  onClick: () => void;
}
