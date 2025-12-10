import type { KanbanColumn, KanbanCard } from '@/types/kanban.types';

export interface KanbanColumnProps {
  column: KanbanColumn;
  cards: KanbanCard[];
  selectedEmailId: string | null;
  onSelectEmail: (emailId: string) => void;
}
