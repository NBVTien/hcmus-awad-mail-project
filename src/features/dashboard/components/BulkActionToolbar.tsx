import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Mail, MailOpen } from 'lucide-react';

type Props = {
  selectedCount: number;
  totalCount: number;
  selectAll: boolean;
  onToggleSelectAll: () => void;
  onBulkDelete: () => void;
  onBulkMarkRead: () => void;
  onBulkMarkUnread: () => void;
};

export const BulkActionToolbar: React.FC<Props> = ({
  selectedCount,
  selectAll,
  onToggleSelectAll,
  onBulkDelete,
  onBulkMarkRead,
  onBulkMarkUnread,
}) => {
  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b bg-slate-50">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={selectAll}
          onCheckedChange={onToggleSelectAll}
          aria-label="Select all emails"
        />
        <span className="text-sm text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} selected` : 'Select all'}
        </span>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={onBulkDelete}
            className="px-2 py-1 rounded text-sm bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1"
            aria-label="Delete selected emails"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>

          <button
            onClick={onBulkMarkRead}
            className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1"
            aria-label="Mark selected as read"
          >
            <MailOpen className="h-4 w-4" />
            Mark Read
          </button>

          <button
            onClick={onBulkMarkUnread}
            className="px-2 py-1 rounded text-sm bg-slate-100 text-slate-800 hover:bg-slate-200 flex items-center gap-1"
            aria-label="Mark selected as unread"
          >
            <Mail className="h-4 w-4" />
            Mark Unread
          </button>
        </div>
      )}
    </div>
  );
};
