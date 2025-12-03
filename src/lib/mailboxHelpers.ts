import type { Mailbox } from '@/types/email.types';

/**
 * Get icon for a mailbox based on its ID
 */
export function getMailboxIcon(mailboxId: string): string | undefined {
  const iconMap: Record<string, string> = {
    'INBOX': '📥',
    'SENT': '📤',
    'DRAFT': '📝',
    'TRASH': '🗑️',
    'SPAM': '🚫',
    'STARRED': '⭐',
    'IMPORTANT': '❗',
    'UNREAD': '📬',
    'CATEGORY_PERSONAL': '👤',
    'CATEGORY_SOCIAL': '👥',
    'CATEGORY_PROMOTIONS': '🏷️',
    'CATEGORY_UPDATES': '🔔',
    'CATEGORY_FORUMS': '💬',
  };

  return iconMap[mailboxId.toUpperCase()];
}

/**
 * Get display order for a mailbox based on its ID
 */
export function getMailboxOrder(mailboxId: string): number {
  const orderMap: Record<string, number> = {
    'INBOX': 0,
    'STARRED': 1,
    'IMPORTANT': 2,
    'SENT': 3,
    'DRAFT': 4,
    'SPAM': 5,
    'TRASH': 6,
  };

  // Default order for unknown mailboxes
  const order = orderMap[mailboxId.toUpperCase()];
  return order !== undefined ? order : 100;
}

/**
 * Enhance mailboxes with client-side properties (icon and order)
 */
export function enhanceMailboxes(mailboxes: Mailbox[]): Mailbox[] {
  return mailboxes.map(mailbox => ({
    ...mailbox,
    icon: mailbox.icon || getMailboxIcon(mailbox.id),
    order: mailbox.order ?? getMailboxOrder(mailbox.id),
  })).sort((a, b) => a.order - b.order);
}

/**
 * Format mailbox name for display
 */
export function formatMailboxName(name: string): string {
  // Convert category names like "CATEGORY_SOCIAL" to "Social"
  if (name.startsWith('CATEGORY_')) {
    const categoryName = name.replace('CATEGORY_', '');
    return categoryName.charAt(0) + categoryName.slice(1).toLowerCase();
  }

  // Capitalize first letter for system mailboxes
  return name.charAt(0) + name.slice(1).toLowerCase();
}
