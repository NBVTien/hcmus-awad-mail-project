export interface EmailAddress {
  email: string;
  name?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url?: string;
}

export interface Mailbox {
  id: string;
  name: string;
  icon?: string | React.ComponentType<{ className?: string }>;
  unreadCount: number;
  totalCount: number;
  order: number;
  isSystem: boolean;
}

export interface Email {
  id: string;
  mailboxId: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  subject: string;
  body: string;
  snippet: string;
  timestamp: string; // ISO 8601
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments?: Attachment[];
  gmailMessageId?: string;
}

export interface EmailDraft {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: File[] | string[];
  replyToEmailId?: string | null;
  forwardEmailId?: string | null;
}

export interface GetEmailsResponse {
  emails: Email[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetMailboxesResponse {
  mailboxes: Mailbox[];
}

export interface UpdateEmailRequest {
  isRead?: boolean;
  isStarred?: boolean;
}

export interface EmailSelection {
  selectedIds: Set<string>;
  selectAll: boolean;
  count: number;
}

export interface SummaryOptions {
  length?: 'short' | 'medium' | 'long';
  tone?: 'formal' | 'casual' | 'technical';
  customInstructions?: string;
  provider?: string;
}

export interface EmailSummary {
  id: string;
  subject: string;
  summary: string;
  length: string;
  tone: string;
  provider: string;
}

