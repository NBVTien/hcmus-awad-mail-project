import type { Email } from '@/types/email.types';

export interface EmailCardProps {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
}
