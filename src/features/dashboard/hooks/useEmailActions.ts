import { useMutation } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';
import { queryClient } from '@/lib/queryClient';
import { showSuccess, showError } from '@/lib/toast';

export function useEmailActions() {
    const toggleStar = useMutation({
        mutationFn: ({ emailId, isStarred }: { emailId: string; isStarred: boolean }) =>
            emailService.updateEmail(emailId, { isStarred }),

        // Optimistic update across all email queries
        onMutate: async ({ emailId, isStarred }) => {
            await queryClient.cancelQueries({ queryKey: ['emails'] });

            const previous = queryClient.getQueriesData({ queryKey: ['emails'] });

            // Update cached queries optimistically
            previous.forEach(([key]) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                queryClient.setQueryData(key, (old: any) => {
                    if (!old || !old.emails) return old;
                    return {
                        ...old,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        emails: old.emails.map((e: any) =>
                            e.id === emailId ? { ...e, isStarred } : e
                        ),
                    };
                });
            });

            return { previous };
        },

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (_err, _vars, context: any) => {
            // Rollback
            if (context?.previous) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                context.previous.forEach(([key, data]: any) => {
                    queryClient.setQueryData(key, data);
                });
            }
            showError('Failed to update star status');
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
        },

        onSuccess: () => {
            showSuccess('Star updated');
        },
    });

    const toggleRead = useMutation({
        mutationFn: ({ emailId, isRead }: { emailId: string; isRead: boolean }) =>
            emailService.updateEmail(emailId, { isRead }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
            showSuccess('Read status updated');
        },
        onError: () => showError('Failed to update read status'),
    });

    const deleteEmail = useMutation({
        mutationFn: (emailId: string) => emailService.deleteEmail(emailId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
            showSuccess('Email moved to Trash');
        },
        onError: () => showError('Failed to delete email'),
    });

    return { toggleStar, toggleRead, deleteEmail };
}
