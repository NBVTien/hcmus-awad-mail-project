import type { KanbanColumn } from '@/types/kanban.types';

export const DEFAULT_COLUMNS: KanbanColumn[] = [
  {
    id: 'inbox',
    name: 'Inbox',
    color: '#3b82f6',
    order: 0,
  },
  {
    id: 'todo',
    name: 'To Do',
    color: '#f59e0b',
    order: 1,
  },
  {
    id: 'in-progress',
    name: 'In Progress',
    color: '#8b5cf6',
    order: 2,
  },
  {
    id: 'done',
    name: 'Done',
    color: '#10b981',
    order: 3,
  },
  {
    id: 'snoozed',
    name: 'Snoozed',
    color: '#6b7280',
    order: 4,
  },
];
