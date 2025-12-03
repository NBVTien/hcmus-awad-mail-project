import { useMutation } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';
import { queryClient } from '@/lib/queryClient';
import { showSuccess, showError } from '@/lib/toast';

export function useBulkSelection() {
  const bulkDelete = useMutation({
    mutationFn: (emailIds: string[]) => emailService.bulkDelete(emailIds),
    onSuccess: (_, emailIds) => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      showSuccess(`${emailIds.length} email(s) moved to Trash`);
    },
    onError: () => showError('Failed to delete emails'),
  });

  const bulkMarkRead = useMutation({
    mutationFn: ({ emailIds, isRead }: { emailIds: string[]; isRead: boolean }) =>
      emailService.bulkMarkRead(emailIds, isRead),
    onSuccess: (_, { emailIds, isRead }) => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      showSuccess(`${emailIds.length} email(s) marked as ${isRead ? 'read' : 'unread'}`);
    },
    onError: () => showError('Failed to update emails'),
  });

  return { bulkDelete, bulkMarkRead };
}
