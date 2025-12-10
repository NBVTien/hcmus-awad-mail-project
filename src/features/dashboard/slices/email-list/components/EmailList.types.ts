import type { Email } from '@/types/email.types';

export interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (emailId: string) => void;
  isLoading?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (emailId: string) => void;
  showCheckboxes?: boolean;
}

export interface EmailListItemProps {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
  isChecked?: boolean;
  onToggleCheck?: (emailId: string, event: React.MouseEvent) => void;
  showCheckbox?: boolean;
}
