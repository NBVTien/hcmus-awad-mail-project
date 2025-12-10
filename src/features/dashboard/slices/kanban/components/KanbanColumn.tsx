import { useDroppable } from '@dnd-kit/core';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { KanbanCardItem } from './KanbanCardItem';
import type { KanbanColumnProps } from './KanbanColumn.types';

export const KanbanColumn = ({
  column,
  cards,
  selectedEmailId,
  onSelectEmail,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { columnId: column.id },
  });

  return (
    <div className="flex flex-col h-full w-[320px] shrink-0 border rounded-lg bg-muted/30">
      <div
        className="px-4 py-3 border-b bg-background rounded-t-lg"
        style={{ borderTopColor: column.color, borderTopWidth: '3px' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{column.name}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {cards.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-hidden transition-colors',
          isOver && 'bg-accent/50'
        )}
      >
        <ScrollArea className="h-full w-full">
          <div className="p-3 space-y-3 w-full max-w-full">
            {cards.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-center">
                <p className="text-sm text-muted-foreground">No emails</p>
              </div>
            ) : (
              cards.map((card) => (
                <KanbanCardItem
                  key={card.id}
                  card={card}
                  columnId={column.id}
                  isSelected={selectedEmailId === card.emailId}
                  onClick={() => onSelectEmail(card.emailId)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
