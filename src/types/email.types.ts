export interface EmailAddress {
  email: string;
  name?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface Mailbox {
  id: string;
  name: string;
  icon?: string;
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
  subject: string;
  body: string;
  snippet: string;
  timestamp: string; // ISO 8601
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments?: Attachment[];
}

export interface EmailListItem {
  id: string;
  from: EmailAddress;
  subject: string;
  snippet: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
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
