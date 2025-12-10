import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCardItem } from './KanbanCardItem';
import type { KanbanBoardProps } from './KanbanBoard.types';
import type { KanbanCard } from '@/types/kanban.types';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const KanbanBoard = ({
  columns,
  selectedEmailId,
  onSelectEmail,
  onMoveEmail,
  isLoading,
}: KanbanBoardProps) => {
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const card = event.active.data.current?.card;
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || active.id === over.id) return;

    const cardId = active.id as string;
    const sourceColumnId = active.data.current?.columnId as string;
    const targetColumnId = (over.data.current?.columnId || over.id) as string;

    if (!sourceColumnId || !targetColumnId) return;

    // Find the card being moved
    const sourceColumn = columns.find((col) => col.id === sourceColumnId);
    const card = sourceColumn?.cards?.find((c) => c.id === cardId);

    if (!card) return;

    // Calculate new order (add to end of target column)
    const targetColumn = columns.find((col) => col.id === targetColumnId);
    const newOrder = (targetColumn?.cards?.length || 0);

    onMoveEmail(card.emailId, sourceColumnId, targetColumnId, newOrder);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner message="Loading Kanban board..." />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="h-full w-full">
        <div className="flex gap-4 p-4 h-full min-w-max">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={column.cards || []}
              selectedEmailId={selectedEmailId}
              onSelectEmail={onSelectEmail}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DragOverlay>
        {activeCard && activeCard.email && (
          <div className="rotate-3 opacity-90">
            <KanbanCardItem
              card={activeCard}
              columnId={activeCard.columnId}
              isSelected={false}
              onClick={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
