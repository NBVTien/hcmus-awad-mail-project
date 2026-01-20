import type { Mailbox } from '@/types/email.types';
import type { LucideIcon } from 'lucide-react';
import {
  Inbox,
  Send,
  FileText,
  Trash2,
  AlertOctagon,
  Star,
  AlertCircle,
  Mail,
  MessageSquare,
  User,
  Users,
  Tag,
  Bell,
  MessagesSquare,
  Folder,
} from 'lucide-react';

/**
 * Get icon component for a mailbox based on its ID
 */
export function getMailboxIcon(mailboxId: string): LucideIcon {
  const iconMap: Record<string, LucideIcon> = {
    'INBOX': Inbox,
    'SENT': Send,
    'DRAFT': FileText,
    'TRASH': Trash2,
    'SPAM': AlertOctagon,
    'STARRED': Star,
    'IMPORTANT': AlertCircle,
    'UNREAD': Mail,
    'CHAT': MessageSquare,
    'CATEGORY_PERSONAL': User,
    'CATEGORY_SOCIAL': Users,
    'CATEGORY_PROMOTIONS': Tag,
    'CATEGORY_UPDATES': Bell,
    'CATEGORY_FORUMS': MessagesSquare,
    'YELLOW_STAR': Star,
  };

  return iconMap[mailboxId.toUpperCase()] || Folder;
}

/**
 * Get display order for a mailbox based on its ID
 */
export function getMailboxOrder(mailboxId: string): number {
  const orderMap: Record<string, number> = {
    // Primary mailboxes
    'INBOX': 0,
    'STARRED': 1,
    'IMPORTANT': 2,
    'SENT': 3,
    'DRAFT': 4,
    'UNREAD': 5,

    // Categories
    'CATEGORY_PERSONAL': 10,
    'CATEGORY_SOCIAL': 11,
    'CATEGORY_PROMOTIONS': 12,
    'CATEGORY_UPDATES': 13,
    'CATEGORY_FORUMS': 14,

    // Special
    'CHAT': 20,
    'YELLOW_STAR': 21,

    // Cleanup
    'SPAM': 90,
    'TRASH': 91,
  };

  // Default order for unknown mailboxes
  const order = orderMap[mailboxId.toUpperCase()];
  return order !== undefined ? order : 100;
}

/**
 * Enhance mailboxes with client-side properties (icon, order, and formatted name)
 */
export function enhanceMailboxes(mailboxes: Mailbox[]): Mailbox[] {
  return mailboxes.map(mailbox => ({
    ...mailbox,
    name: formatMailboxName(mailbox.name),
    icon: mailbox.icon || getMailboxIcon(mailbox.id),
    order: mailbox.order ?? getMailboxOrder(mailbox.id),
  })).sort((a, b) => a.order - b.order);
}

/**
 * Format mailbox name for display
 */
export function formatMailboxName(name: string): string {
  // Handle special cases with custom names
  const nameMap: Record<string, string> = {
    'INBOX': 'Inbox',
    'SENT': 'Sent',
    'DRAFT': 'Drafts',
    'TRASH': 'Trash',
    'SPAM': 'Spam',
    'STARRED': 'Starred',
    'IMPORTANT': 'Important',
    'UNREAD': 'Unread',
    'CHAT': 'Chats',
    'YELLOW_STAR': 'Starred',
    'CATEGORY_PERSONAL': 'Personal',
    'CATEGORY_SOCIAL': 'Social',
    'CATEGORY_PROMOTIONS': 'Promotions',
    'CATEGORY_UPDATES': 'Updates',
    'CATEGORY_FORUMS': 'Forums',
  };

  const upperName = name.toUpperCase();
  if (nameMap[upperName]) {
    return nameMap[upperName];
  }

  // Convert category names like "CATEGORY_SOCIAL" to "Social"
  if (name.startsWith('CATEGORY_')) {
    const categoryName = name.replace('CATEGORY_', '');
    return categoryName.charAt(0) + categoryName.slice(1).toLowerCase();
  }

  // Capitalize first letter for other mailboxes
  return name.charAt(0) + name.slice(1).toLowerCase();
}
