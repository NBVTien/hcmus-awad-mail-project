import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kanbanService } from '@/services/kanbanService';
import type { KanbanColumn, MoveCardDto } from '@/types/kanban.types';
import { toast } from 'sonner';

interface MoveEmailParams {
  emailId: string;
  fromColumnId: string;
  toColumnId: string;
  order: number;
}

export const useKanbanBoard = (mailboxId: string) => {
  const queryClient = useQueryClient();

  // Fetch Kanban board data from backend
  const boardQuery = useQuery({
    queryKey: ['kanban-board', mailboxId],
    queryFn: () => kanbanService.getKanbanBoard(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every 60 seconds to catch resumed snoozes
  });

  const moveEmailMutation = useMutation({
    mutationFn: async (params: MoveEmailParams) => {
      const dto: MoveCardDto = {
        emailId: params.emailId,
        fromColumnId: params.fromColumnId,
        toColumnId: params.toColumnId,
        order: params.order,
      };
      return kanbanService.moveCard(dto);
    },
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['kanban-board', mailboxId] });

      // Snapshot previous value
      const previousBoard = queryClient.getQueryData<KanbanColumn[]>(['kanban-board', mailboxId]);

      // Optimistically update the board
      if (previousBoard) {
        const newBoard = previousBoard.map((column) => {
          if (column.id === params.fromColumnId) {
            // Remove card from source column
            return {
              ...column,
              cards: column.cards?.filter((card) => card.emailId !== params.emailId) || [],
            };
          }
          if (column.id === params.toColumnId) {
            // Add card to destination column
            const newCard = {
              id: `temp-${params.emailId}`,
              emailId: params.emailId,
              columnId: params.toColumnId,
              order: params.order,
            };
            const cards = [...(column.cards || []), newCard];
            return { ...column, cards };
          }
          return column;
        });
        queryClient.setQueryData(['kanban-board', mailboxId], newBoard);
      }

      return { previousBoard };
    },
    onSuccess: (_, params) => {
      const columns = boardQuery.data || [];
      const columnName = columns.find((col) => col.id === params.toColumnId)?.name || params.toColumnId;
      toast.success(`Email moved to ${columnName}`);
    },
    onError: (error, _, context) => {
      // Rollback to previous state
      if (context?.previousBoard) {
        queryClient.setQueryData(['kanban-board', mailboxId], context.previousBoard);
      }
      toast.error('Failed to move email');
      console.error('Failed to move email:', error);
    },
    onSettled: () => {
      // Refetch to sync with backend
      queryClient.invalidateQueries({ queryKey: ['kanban-board', mailboxId] });
    },
  });

  return {
    columns: boardQuery.data || [],
    isLoading: boardQuery.isLoading,
    isError: boardQuery.isError,
    moveEmail: (emailId: string, fromColumnId: string, toColumnId: string, order: number) => {
      moveEmailMutation.mutate({ emailId, fromColumnId, toColumnId, order });
    },
    refetch: boardQuery.refetch,
  };
};
