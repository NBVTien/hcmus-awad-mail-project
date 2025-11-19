import type { Email } from '@/types/email.types';

export interface EmailDetailProps {
  email: Email | null;
  isLoading?: boolean;
  onDeleteSuccess?: () => void;
  onReply?: () => void;
  onReplyAll?: () => void;
  onForward?: () => void;
}

export interface EmailHeaderProps {
  subject: string;
  from: {
    email: string;
    name?: string;
  };
  timestamp: string;
}

export interface EmailBodyProps {
  body: string;
}

export interface AttachmentListProps {
  attachments?: Array<{
    id: string;
    filename: string;
    mimeType: string;
    size: number;
  }>;
}
