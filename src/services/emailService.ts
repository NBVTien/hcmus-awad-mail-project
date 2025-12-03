import apiClient from '@/lib/apiClient';
import type {
  Mailbox,
  Email,
  GetEmailsResponse,
  GetMailboxesResponse,
  UpdateEmailRequest,
  EmailDraft,
} from '@/types/email.types';

/**
 * Real email service that communicates with the backend API
 */
export const emailService = {
  /**
   * Get all mailboxes/labels
   */
  async getMailboxes(): Promise<GetMailboxesResponse> {
    const response = await apiClient.get('/emails/mailboxes');

    // Response is array of mailboxes, wrap it in the expected format
    return {
      mailboxes: Array.isArray(response.data) ? response.data : response.data.mailboxes || [],
    };
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

    return response.data;
  },

  /**
   * Get email by ID
   */
  async getEmailById(emailId: string): Promise<Email> {
    const response = await apiClient.get(`/emails/${emailId}`);
    return response.data;
  },

  /**
   * Update email (mark as read/starred)
   */
  async updateEmail(emailId: string, updates: UpdateEmailRequest): Promise<Email> {
    // Backend uses /emails/:id/modify with different field names
    const backendUpdates: Record<string, boolean> = {};

    if (updates.isRead !== undefined) {
      backendUpdates.read = updates.isRead;
    }
    if (updates.isStarred !== undefined) {
      backendUpdates.starred = updates.isStarred;
    }

    await apiClient.post(`/emails/${emailId}/modify`, backendUpdates);

    // Backend returns { message }, so fetch the updated email
    return this.getEmailById(emailId);
  },

  /**
   * Delete email (move to trash)
   */
  async deleteEmail(emailId: string): Promise<void> {
    // Backend has a specific delete endpoint
    await apiClient.post(`/emails/${emailId}/delete`);
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

    // Backend returns { message, messageId, threadId }
    // Return the sent email by fetching it (or construct a minimal Email object)
    // For now, we'll construct a minimal object since we don't have the full email
    const sentEmail: Email = {
      id: response.data.messageId,
      mailboxId: 'SENT',
      from: { email: '', name: 'You' }, // Will be filled from user profile
      to: draft.to.map(email => ({ email })),
      cc: draft.cc?.map(email => ({ email })),
      subject: draft.subject,
      body: draft.body,
      snippet: draft.body.slice(0, 150),
      timestamp: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      hasAttachments: false,
    };

    return sentEmail;
  },

  /**
   * Bulk delete emails (implemented as sequential calls)
   */
  async bulkDelete(emailIds: string[]): Promise<void> {
    // Execute delete operations sequentially
    for (const emailId of emailIds) {
      try {
        await this.deleteEmail(emailId);
      } catch (error) {
        console.error(`Failed to delete email ${emailId}:`, error);
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
};
