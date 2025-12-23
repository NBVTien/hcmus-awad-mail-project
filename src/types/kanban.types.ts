export interface KanbanColumn {
  id: string;
  name: string;
  order: number;
  color?: string;
  status?: string;
  labelId?: string; // Gmail label ID mapping
  isActive?: boolean;
  cards?: KanbanCard[];
}

export interface KanbanCard {
  id: string;
  emailId: string;
  columnId: string;
  order: number;
  notes?: string;
  email?: {
    id: string;
    subject: string;
    preview: string;
    fromName: string;
    fromEmail: string;
    isRead?: boolean;
    isStarred?: boolean;
    hasAttachments?: boolean;
    timestamp?: string;
  };
}

export interface MoveCardDto {
  emailId: string;
  fromColumnId: string;
  toColumnId: string;
  order?: number;
}

export interface CreateColumnDto {
  name: string;
  order: number;
  color?: string;
  status?: string;
  labelId?: string; // Gmail label ID mapping
  isActive?: boolean;
}
