import type {
  Mailbox,
  Email,
  GetEmailsResponse,
  GetMailboxesResponse,
  UpdateEmailRequest,
} from '@/types/email.types';
import { randomDelay, throwApiError } from './mockHelpers';
import mockFolders from '@/data/mockFolders.json';
import mockEmails from '@/data/mockEmails.json';

// In-memory email state (for demo purposes)
let emailsState: Email[] = JSON.parse(JSON.stringify(mockEmails));
let mailboxesState: Mailbox[] = JSON.parse(JSON.stringify(mockFolders));

export const mockEmailService = {
  async getMailboxes(): Promise<GetMailboxesResponse> {
    await randomDelay(200, 400);

    return {
      mailboxes: mailboxesState,
    };
  },

  async getEmailsByMailbox(
    mailboxId: string,
    params?: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
    }
  ): Promise<GetEmailsResponse> {
    await randomDelay(200, 500);

    const { page = 1, limit = 50, unreadOnly = false } = params || {};

    // Filter emails by mailbox
    let filteredEmails = emailsState.filter((email) => {
      // For "starred" mailbox, show all starred emails regardless of mailbox
      if (mailboxId === 'starred') {
        return email.isStarred;
      }
      return email.mailboxId === mailboxId;
    });

    // Apply unreadOnly filter
    if (unreadOnly) {
      filteredEmails = filteredEmails.filter((email) => !email.isRead);
    }

    // Sort by timestamp (newest first)
    filteredEmails.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Pagination
    const total = filteredEmails.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const emails = filteredEmails.slice(start, end);

    return {
      emails,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  async getEmailById(emailId: string): Promise<Email> {
    await randomDelay(200, 400);

    const email = emailsState.find((e) => e.id === emailId);

    if (!email) {
      return throwApiError('EMAIL_NOT_FOUND', 'Email not found', 404);
    }

    // Mark as read when fetched
    if (!email.isRead) {
      email.isRead = true;
      this.updateUnreadCounts();
    }

    return email;
  },

  async updateEmail(emailId: string, updates: UpdateEmailRequest): Promise<Email> {
    await randomDelay(100, 200);

    const email = emailsState.find((e) => e.id === emailId);

    if (!email) {
      return throwApiError('EMAIL_NOT_FOUND', 'Email not found', 404);
    }

    // Apply updates
    if (updates.isRead !== undefined) {
      email.isRead = updates.isRead;
    }
    if (updates.isStarred !== undefined) {
      email.isStarred = updates.isStarred;
    }

    // Update unread counts
    this.updateUnreadCounts();

    return email;
  },

  // Helper: Update unread counts for all mailboxes
  updateUnreadCounts() {
    mailboxesState.forEach((mailbox) => {
      const mailboxEmails = emailsState.filter((email) => {
        if (mailbox.id === 'starred') {
          return email.isStarred;
        }
        return email.mailboxId === mailbox.id;
      });

      mailbox.unreadCount = mailboxEmails.filter((email) => !email.isRead).length;
      mailbox.totalCount = mailboxEmails.length;
    });
  },

  // Reset state (for testing purposes)
  resetState() {
    emailsState = JSON.parse(JSON.stringify(mockEmails));
    mailboxesState = JSON.parse(JSON.stringify(mockFolders));
  },
};
