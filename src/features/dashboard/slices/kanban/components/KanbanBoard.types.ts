import type { KanbanColumn } from '@/types/kanban.types';

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  selectedEmailId: string | null;
  onSelectEmail: (emailId: string) => void;
  onMoveEmail: (emailId: string, fromColumnId: string, toColumnId: string, order: number) => void;
  isLoading: boolean;
}
