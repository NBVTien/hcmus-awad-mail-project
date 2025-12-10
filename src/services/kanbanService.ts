import apiClient from '@/lib/apiClient';
import type { KanbanColumn, KanbanCard, MoveCardDto, CreateColumnDto } from '@/types/kanban.types';

class KanbanService {
  /**
   * Get Kanban board with all columns and cards
   */
  async getKanbanBoard(): Promise<KanbanColumn[]> {
    const response = await apiClient.get('/emails/kanban/board');
    return response.data;
  }

  /**
   * Move a card between columns (drag and drop)
   */
  async moveCard(dto: MoveCardDto): Promise<KanbanCard> {
    const response = await apiClient.post('/emails/kanban/cards/move', dto);
    return response.data;
  }

  /**
   * Add an email to a Kanban column
   */
  async addCardToColumn(
    emailId: string,
    columnId: string,
    order?: number
  ): Promise<KanbanCard> {
    const response = await apiClient.post(`/emails/kanban/cards/${emailId}/add`, {
      columnId,
      order,
    });
    return response.data;
  }

  /**
   * Create a new Kanban column
   */
  async createColumn(dto: CreateColumnDto): Promise<KanbanColumn> {
    const response = await apiClient.post('/emails/kanban/columns', dto);
    return response.data;
  }

  /**
   * Update a Kanban column
   */
  async updateColumn(
    columnId: string,
    dto: Partial<CreateColumnDto>
  ): Promise<KanbanColumn> {
    const response = await apiClient.put(`/emails/kanban/columns/${columnId}`, dto);
    return response.data;
  }

  /**
   * Delete a Kanban column
   */
  async deleteColumn(columnId: string): Promise<void> {
    await apiClient.delete(`/emails/kanban/columns/${columnId}`);
  }

  /**
   * Remove a card from Kanban board
   */
  async removeCard(cardId: string): Promise<void> {
    await apiClient.delete(`/emails/kanban/cards/${cardId}`);
  }

  /**
   * Update Kanban card notes
   */
  async updateCardNotes(cardId: string, notes: string): Promise<KanbanCard> {
    const response = await apiClient.put(`/emails/kanban/cards/${cardId}/notes`, { notes });
    return response.data;
  }

  /**
   * Get all cards in a specific column
   */
  async getColumnCards(columnId: string): Promise<KanbanCard[]> {
    const response = await apiClient.get(`/emails/kanban/columns/${columnId}/cards`);
    return response.data;
  }

  /**
   * Reorder cards within a column
   */
  async reorderCards(columnId: string, cardIds: string[]): Promise<void> {
    await apiClient.post(`/emails/kanban/columns/${columnId}/reorder`, { cardIds });
  }
}

export const kanbanService = new KanbanService();
