import type { Email } from '@/types/email.types';

export interface EmailDetailProps {
  email: Email | null;
  isLoading?: boolean;
  onDeleteSuccess?: () => void;
  onReply?: () => void;
  onReplyAll?: () => void;
  onForward?: () => void;
}
