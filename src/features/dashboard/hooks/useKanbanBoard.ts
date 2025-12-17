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

type SortBy = 'date_newest' | 'date_oldest' | 'sender_name' | 'relevance';
type FilterType = 'unread' | 'has_attachments' | 'starred';

export const useKanbanBoard = (
  mailboxId: string,
  sortBy?: SortBy,
  filters?: FilterType[]
) => {
  const queryClient = useQueryClient();

  // Fetch Kanban board data from backend with filtering/sorting
  const boardQuery = useQuery({
    queryKey: ['kanban-board', mailboxId, sortBy, filters],
    queryFn: async () => {
      // First get the board structure (columns)
      const columns = await kanbanService.getKanbanBoard();

      // If no filters or sorting, return as-is
      if (!sortBy && (!filters || filters.length === 0)) {
        return columns;
      }

      // Otherwise, fetch filtered/sorted cards for each column
      const columnsWithFilteredCards = await Promise.all(
        columns.map(async (column) => {
          try {
            const result = await kanbanService.getFilteredColumnCards(
              column.id,
              sortBy,
              filters
            );
            return {
              ...column,
              cards: result.cards,
            };
          } catch (error) {
            console.error(`Failed to fetch filtered cards for column ${column.id}:`, error);
            return column; // Fallback to original column data
          }
        })
      );

      return columnsWithFilteredCards;
    },
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
        // Find the card being moved
        let movedCard = null;
        for (const column of previousBoard) {
          const card = column.cards?.find((c) => c.emailId === params.emailId);
          if (card) {
            movedCard = card;
            break;
          }
        }

        if (movedCard) {
          const newBoard = previousBoard.map((column) => {
            if (column.id === params.fromColumnId) {
              // Remove card from source column
              return {
                ...column,
                cards: column.cards?.filter((card) => card.emailId !== params.emailId) || [],
              };
            }
            if (column.id === params.toColumnId) {
              // Add card to destination column only if it doesn't already exist
              const existingCards = column.cards || [];
              const cardExists = existingCards.some((card) => card.emailId === params.emailId);

              if (cardExists) {
                // Update existing card
                return {
                  ...column,
                  cards: existingCards.map((card) =>
                    card.emailId === params.emailId
                      ? { ...card, columnId: params.toColumnId, order: params.order }
                      : card
                  ),
                };
              } else {
                // Add new card with full data
                const newCard = {
                  ...movedCard,
                  columnId: params.toColumnId,
                  order: params.order,
                };
                return { ...column, cards: [...existingCards, newCard] };
              }
            }
            return column;
          });
          queryClient.setQueryData(['kanban-board', mailboxId], newBoard);
        }
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
