import { useDraggable } from '@dnd-kit/core';
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
        'p-3 bg-card border rounded-lg shadow-sm transition-all cursor-pointer mb-2',
        'hover:shadow-md',
        isSelected && 'ring-2 ring-primary bg-accent',
        isDragging && 'opacity-50'
      )}
    >
      <div className="space-y-1">
        <div className="text-sm font-medium truncate">
          {card.email.fromName || card.email.fromEmail}
        </div>
        <div className="text-sm truncate font-semibold">
          {card.email.subject || '(No subject)'}
        </div>
        <div className="text-xs text-muted-foreground line-clamp-2">{card.email.preview}</div>
      </div>

      {card.notes && (
        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground italic">
          {card.notes}
        </div>
      )}
    </div>
  );
};
