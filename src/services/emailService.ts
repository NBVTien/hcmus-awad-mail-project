import apiClient from '@/lib/apiClient';
import type {
  Mailbox,
  Email,
  GetEmailsResponse,
  GetMailboxesResponse,
  UpdateEmailRequest,
  EmailDraft,
  EmailAddress,
  Attachment,
} from '@/types/email.types';
import type { Snooze, PaginatedResponse } from '@/types/snooze.types';

/**
 * Backend email format from Gmail API
 */
interface BackendEmail {
  id: string;
  labelIds?: string[];
  from: string | { email: string; name?: string };
  to?: string | { email: string; name?: string } | Array<string | { email: string; name?: string }>;
  toEmail?: string;
  cc?: Array<string | { email: string; name?: string }>;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  body?: string;
  snippet?: string;
  date?: Date | string;
  internalDate?: string;
  read?: boolean;
  starred?: boolean;
  attachments?: Attachment[];
}

/**
 * Backend search result format (raw database format)
 */
interface BackendSearchResult {
  id: string;
  subject?: string;
  body?: string;
  preview?: string;
  from_name?: string;
  from_email: string;
  to_email?: string;
  read?: boolean;
  starred?: boolean;
  folder?: string;
  attachments?: Attachment[];
  created_at?: string;
  similarity?: number;
}

interface BackendMailbox {
  id: string;
  name: string;
  messagesTotal?: number;
  messagesUnread?: number;
  type?: string;
}

/**
 * Transform backend search result to frontend Email format
 */
const transformSearchResult = (result: BackendSearchResult): Email => {
  return {
    id: result.id,
    mailboxId: result.folder || 'INBOX',
    from: {
      email: result.from_email,
      name: result.from_name || result.from_email.split('@')[0],
    },
    to: result.to_email
      ? [{ email: result.to_email, name: result.to_email.split('@')[0] }]
      : [],
    subject: result.subject || '(No Subject)',
    body: result.body || '',
    snippet: result.preview || '',
    timestamp: result.created_at ? new Date(result.created_at).toISOString() : new Date().toISOString(),
    isRead: result.read ?? true,
    isStarred: result.starred ?? false,
    hasAttachments: (result.attachments && result.attachments.length > 0) || false,
    attachments: result.attachments,
  };
};

/**
 * Transform backend Gmail email format to frontend format
 */
const transformEmail = (backendEmail: BackendEmail): Email => {
  // Parse email address from backend format
  const parseEmailAddress = (addr: string | { email: string; name?: string }): EmailAddress => {
    if (typeof addr === 'string') {
      return { email: addr, name: addr.split('@')[0] };
    }
    return { email: addr.email || '', name: addr.name || addr.email?.split('@')[0] || '' };
  };

  // Parse timestamp - could be Date object, ISO string, or milliseconds
  let timestamp: string;
  if (backendEmail.date) {
    timestamp = backendEmail.date instanceof Date
      ? backendEmail.date.toISOString()
      : new Date(backendEmail.date).toISOString();
  } else if (backendEmail.internalDate) {
    timestamp = new Date(parseInt(backendEmail.internalDate)).toISOString();
  } else {
    timestamp = new Date().toISOString();
  }

  return {
    id: backendEmail.id,
    mailboxId: backendEmail.labelIds?.[0] || 'INBOX',
    from: parseEmailAddress(backendEmail.from),
    to: Array.isArray(backendEmail.to)
      ? backendEmail.to.map(parseEmailAddress)
      : [parseEmailAddress(backendEmail.to || backendEmail.toEmail || '')],
    cc: backendEmail.cc ? backendEmail.cc.map(parseEmailAddress) : undefined,
    subject: backendEmail.subject || '(No Subject)',
    body: backendEmail.htmlBody || backendEmail.textBody || backendEmail.body || '',
    snippet: backendEmail.snippet || '',
    timestamp,
    isRead: backendEmail.read !== undefined ? backendEmail.read : !backendEmail.labelIds?.includes('UNREAD'),
    isStarred: backendEmail.starred !== undefined ? backendEmail.starred : backendEmail.labelIds?.includes('STARRED') || false,
    hasAttachments: (backendEmail.attachments && backendEmail.attachments.length > 0) || false,
    attachments: backendEmail.attachments,
  };
};

/**
 * Real email service that communicates with the backend API
 */
export const emailService = {
  /**
   * Get all mailboxes/labels
   */
  async getMailboxes(): Promise<GetMailboxesResponse> {
    const response = await apiClient.get('/emails/mailboxes');

    // Backend returns array: [{ id, name, messagesTotal, messagesUnread, type }]
    const backendMailboxes = Array.isArray(response.data) ? response.data : [];

    // Transform to frontend format
    const mailboxes: Mailbox[] = backendMailboxes.map((mb: BackendMailbox, index: number) => ({
      id: mb.id,
      name: mb.name,
      icon: undefined,
      unreadCount: mb.messagesUnread || 0,
      totalCount: mb.messagesTotal || 0,
      order: index,
      isSystem: mb.type === 'system',
    }));

    return { mailboxes };
  },

  /**
   * Get emails by mailbox with pagination
   */
  async getEmailsByMailbox(
    mailboxId: string,
    params?: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
    }
  ): Promise<GetEmailsResponse> {
    const { page = 1, limit = 50 } = params || {};

    const response = await apiClient.get('/emails/list', {
      params: {
        folder: mailboxId,
        page,
        limit,
      },
    });

    // Backend returns { emails: [...], pagination: {...} }
    const backendData = response.data;
    return {
      emails: backendData.emails.map(transformEmail),
      pagination: backendData.pagination,
    };
  },

  /**
   * Get email by ID
   */
  async getEmailById(emailId: string): Promise<Email> {
    const response = await apiClient.get(`/emails/${emailId}`);
    const data = response.data;

    // Check if it's database format (has from_email) or Gmail API format (has from object/string)
    if ('from_email' in data) {
      // Database format from search/direct query
      return transformSearchResult(data);
    } else {
      // Gmail API format
      return transformEmail(data);
    }
  },

  /**
   * Update email (mark as read/starred)
   */
  async updateEmail(emailId: string, updates: UpdateEmailRequest): Promise<Email> {
    // Backend uses /emails/:id/modify with field names: read, starred
    const backendUpdates: Record<string, boolean> = {};

    if (updates.isRead !== undefined) {
      backendUpdates.read = updates.isRead;
    }
    if (updates.isStarred !== undefined) {
      backendUpdates.starred = updates.isStarred;
    }

    // Backend returns { message: 'Email modified successfully' }
    await apiClient.post(`/emails/${emailId}/modify`, backendUpdates);

    // Fetch and return the updated email
    return this.getEmailById(emailId);
  },

  /**
   * Delete email (permanently delete)
   */
  async deleteEmail(emailId: string): Promise<void> {
    // Backend returns { message: 'Email deleted permanently' }
    await apiClient.post(`/emails/${emailId}/delete`);
  },

  /**
   * Move email to trash
   */
  async trashEmail(emailId: string): Promise<void> {
    await apiClient.post(`/emails/${emailId}/modify`, { trash: true });
  },

  /**
   * Send a new email
   */
  async sendEmail(draft: EmailDraft): Promise<Email> {
    const response = await apiClient.post('/emails/send', {
      to: draft.to,
      cc: draft.cc,
      bcc: draft.bcc,
      subject: draft.subject,
      body: draft.body,
    });

    // Backend returns { message: 'Email sent successfully', messageId, threadId }
    // Construct a minimal email object representing the sent email
    const sentEmail: Email = {
      id: response.data.messageId || response.data.id,
      mailboxId: 'SENT',
      from: { email: '', name: 'You' }, // Will be filled from user profile
      to: draft.to.map(email => ({ email, name: email.split('@')[0] })),
      cc: draft.cc?.map(email => ({ email, name: email.split('@')[0] })),
      subject: draft.subject,
      body: draft.body,
      snippet: draft.body.replace(/<[^>]*>/g, '').slice(0, 150), // Strip HTML for snippet
      timestamp: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      hasAttachments: false,
    };

    return sentEmail;
  },

  /**
   * Reply to an email
   */
  async replyToEmail(emailId: string, body: string, replyAll: boolean = false, cc?: string[]): Promise<Email> {
    const response = await apiClient.post(`/emails/${emailId}/reply`, {
      body,
      replyAll,
      cc,
    });

    // Backend returns { message: 'Reply sent successfully', messageId, threadId }
    // Construct a minimal email object
    const replyEmail: Email = {
      id: response.data.messageId || response.data.id,
      mailboxId: 'SENT',
      from: { email: '', name: 'You' },
      to: [], // Would need to fetch original email to get proper recipient
      subject: 'Re: (reply)',
      body,
      snippet: body.replace(/<[^>]*>/g, '').slice(0, 150),
      timestamp: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      hasAttachments: false,
    };

    return replyEmail;
  },

  /**
   * Bulk delete emails (move to trash - implemented as sequential calls)
   */
  async bulkDelete(emailIds: string[]): Promise<void> {
    // Execute trash operations sequentially (use trash instead of permanent delete)
    for (const emailId of emailIds) {
      try {
        await this.trashEmail(emailId);
      } catch (error) {
        console.error(`Failed to trash email ${emailId}:`, error);
        // Continue with other emails even if one fails
      }
    }
  },

  /**
   * Bulk mark emails as read/unread (implemented as sequential calls)
   */
  async bulkMarkRead(emailIds: string[], isRead: boolean): Promise<void> {
    // Execute update operations sequentially
    for (const emailId of emailIds) {
      try {
        await this.updateEmail(emailId, { isRead });
      } catch (error) {
        console.error(`Failed to update email ${emailId}:`, error);
        // Continue with other emails even if one fails
      }
    }
  },

  /**
   * Download attachment
   */
  async downloadAttachment(messageId: string, attachmentId: string): Promise<Blob> {
    const response = await apiClient.get(
      `/emails/${messageId}/attachments/${attachmentId}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Unified search using backend combined fuzzy + semantic search
   *
   * Backend implementation provides:
   * - Fuzzy search with typo tolerance (PostgreSQL pg_trgm)
   * - Semantic search using embeddings (configurable)
   * - Multi-field search (subject, from_email, body)
   * - Intelligent result combination and ranking
   *
   * @param query - Search query string
   */
  async searchEmails(query: string): Promise<Email[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      // Use unified search endpoint (GET /emails/search)
      const response = await apiClient.get('/emails/search', {
        params: {
          query: query.trim(),
        },
      });

      // Backend returns array of normalized email objects directly
      const emails = Array.isArray(response.data) ? response.data : [];

      // Transform to frontend format if needed
      return emails.map((email: BackendEmail | BackendSearchResult) => {
        // Check if it's database format or Gmail API format
        if ('from_email' in email) {
          return transformSearchResult(email as BackendSearchResult);
        } else {
          return transformEmail(email as BackendEmail);
        }
      });
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  },

  /**
   * Fuzzy search in a specific field only
   *
   * @param field - Field to search: 'subject', 'from_email', or 'body'
   * @param query - Search query
   * @param options - Search options
   */
  async searchEmailsByField(
    field: 'subject' | 'from_email' | 'body',
    query: string,
    options?: {
      limit?: number;
      threshold?: number;
    }
  ): Promise<Email[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const response = await apiClient.post(`/emails/search/fuzzy/${field}`, null, {
        params: {
          q: query.trim(),
          limit: options?.limit || 20,
          threshold: options?.threshold || 0.3,
        },
      });

      // Backend returns: { field, query, count, results: [...] }
      const backendResults = response.data.results || [];

      // Transform search results to frontend Email format
      return backendResults.map((result: BackendSearchResult) => transformSearchResult(result));
    } catch (error) {
      console.error(`Error performing fuzzy search on field ${field}:`, error);
      throw error;
    }
  },

  /**
   * SMTP Configuration Management
   *
   * NOTE: These endpoints are available but no UI has been implemented yet.
   * The backend supports full CRUD operations for SMTP/IMAP configurations.
   *
   * To implement SMTP config UI:
   * 1. Create a settings page/modal for email accounts
   * 2. Use these service methods to manage configs
   * 3. Add form validation for SMTP/IMAP settings
   * 4. Implement connection testing before saving
   */

  /**
   * Create a new SMTP/IMAP configuration
   */
  async createSmtpConfig(config: {
    emailAddress: string;
    displayName?: string;
    imapHost: string;
    imapPort?: number;
    imapSecure?: boolean;
    imapUsername: string;
    imapPassword: string;
    smtpHost: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    smtpUsername: string;
    smtpPassword: string;
    isDefault?: boolean;
  }) {
    const response = await apiClient.post('/emails/smtp-config', config);
    return response.data;
  },

  /**
   * Get all SMTP configurations for the current user
   */
  async getSmtpConfigs() {
    const response = await apiClient.get('/emails/smtp-config');
    return response.data;
  },

  /**
   * Get a specific SMTP configuration
   */
  async getSmtpConfig(configId: string) {
    const response = await apiClient.get(`/emails/smtp-config/${configId}`);
    return response.data;
  },

  /**
   * Update an SMTP configuration
   */
  async updateSmtpConfig(configId: string, updates: Partial<{
    emailAddress: string;
    displayName?: string;
    imapHost: string;
    imapPort?: number;
    imapSecure?: boolean;
    imapUsername: string;
    imapPassword: string;
    smtpHost: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    smtpUsername: string;
    smtpPassword: string;
    isDefault?: boolean;
  }>) {
    const response = await apiClient.put(`/emails/smtp-config/${configId}`, updates);
    return response.data;
  },

  /**
   * Delete an SMTP configuration
   */
  async deleteSmtpConfig(configId: string) {
    const response = await apiClient.delete(`/emails/smtp-config/${configId}`);
    return response.data;
  },

  /**
   * Test SMTP configuration connection
   */
  async testSmtpConfig(configId: string) {
    const response = await apiClient.post(`/emails/smtp-config/${configId}/test`);
    return response.data;
  },

  /**
   * Set SMTP configuration as default
   */
  async setDefaultSmtpConfig(configId: string) {
    const response = await apiClient.post(`/emails/smtp-config/${configId}/set-default`);
    return response.data;
  },

  /**
   * Snooze an email until a specific date/time
   */
  async snoozeEmail(
    gmailMessageId: string,
    snoozeUntil: Date,
    isRecurring?: boolean,
    recurrencePattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    reason?: string
  ): Promise<Snooze> {
    const response = await apiClient.post(`/emails/${gmailMessageId}/snooze`, {
      snoozeUntil: snoozeUntil.toISOString(),
      isRecurring,
      recurrencePattern,
      reason,
    });
    return response.data;
  },

  /**
   * Get all snoozed emails with pagination
   */
  async getSnoozedEmails(
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<Snooze>> {
    const response = await apiClient.get('/emails/snoozed/list', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get upcoming snoozed emails (within N days)
   */
  async getUpcomingSnoozed(daysAhead: number = 7): Promise<Snooze[]> {
    const response = await apiClient.get('/emails/snoozed/upcoming', {
      params: { daysAhead },
    });
    return response.data;
  },

  /**
   * Get count of snoozed emails
   */
  async getSnoozedCount(): Promise<number> {
    const response = await apiClient.get('/emails/snoozed/count');
    return response.data.count;
  },

  /**
   * Get snooze history (all statuses)
   */
  async getSnoozeHistory(
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<Snooze>> {
    const response = await apiClient.get('/emails/snoozed/history', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get specific snooze details
   */
  async getSnoozeById(snoozeId: string): Promise<Snooze> {
    const response = await apiClient.get(`/emails/snoozed/${snoozeId}`);
    return response.data;
  },

  /**
   * Update snooze time
   */
  async updateSnoozeTime(snoozeId: string, newSnoozeUntil: Date): Promise<Snooze> {
    const response = await apiClient.put(`/emails/snoozed/${snoozeId}/time`, {
      newSnoozeUntil: newSnoozeUntil.toISOString(),
    });
    return response.data;
  },

  /**
   * Manually resume a snoozed email
   */
  async resumeSnooze(snoozeId: string): Promise<void> {
    await apiClient.post(`/emails/snoozed/${snoozeId}/resume`);
  },

  /**
   * Cancel a snooze
   */
  async cancelSnooze(snoozeId: string): Promise<void> {
    await apiClient.post(`/emails/snoozed/${snoozeId}/cancel`);
  },

  /**
   * Generate AI summary for an email
   */
  async generateSummary(
    emailId: string,
    options?: import('@/types/email.types').SummaryOptions
  ): Promise<import('@/types/email.types').EmailSummary> {
    const response = await apiClient.post(`/emails/${emailId}/summary`, {
      length: options?.length || 'medium',
      tone: options?.tone || 'formal',
      customInstructions: options?.customInstructions,
      provider: options?.provider,
    });
    return response.data;
  },
};
