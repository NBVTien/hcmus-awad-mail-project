import type { Email } from '@/types/email.types';

export interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (emailId: string) => void;
  isLoading?: boolean;
}

export interface EmailListItemProps {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
}
