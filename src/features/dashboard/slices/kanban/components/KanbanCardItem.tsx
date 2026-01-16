import { useDraggable } from '@dnd-kit/core';
import { Paperclip } from 'lucide-react';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import type { KanbanCard } from '@/types/kanban.types';

interface KanbanCardItemProps {
  card: KanbanCard;
  columnId: string;
  isSelected: boolean;
  onClick: () => void;
}

export const KanbanCardItem = ({ card, columnId, isSelected, onClick }: KanbanCardItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { card, columnId },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  if (!card.email) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        'p-3 bg-card border rounded-lg shadow-sm transition-all cursor-pointer',
        'w-full',
        isSelected && 'ring-2 ring-primary bg-accent',
        isDragging && 'opacity-50'
      )}
    >
      <div className="space-y-1 w-full">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-medium truncate flex-1">
            {card.email.fromName || card.email.fromEmail}
          </div>
          {card.email.hasAttachments && (
            <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />
          )}
        </div>
        <div className="text-sm truncate font-semibold w-full">
          {card.email.subject || '(No subject)'}
        </div>
        <div className="text-xs text-muted-foreground line-clamp-2 w-full wrap-break-word">
          {card.email.preview}
        </div>
      </div>

      {card.notes && (
        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground italic wrap-break-word">
          {card.notes}
        </div>
      )}
    </div>
  );
};
