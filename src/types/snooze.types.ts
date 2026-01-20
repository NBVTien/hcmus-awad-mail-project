export interface Snooze {
  id: string;
  emailId: string;
  gmailMessageId: string;
  userId: string;
  status: 'SNOOZED' | 'RESUMED' | 'CANCELLED';
  snoozeUntil: string; // ISO date string
  originalLabels?: string[];
  originalFolder?: string;
  snoozeReason?: string;
  isRecurring?: boolean;
  recurrencePattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  resumedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
