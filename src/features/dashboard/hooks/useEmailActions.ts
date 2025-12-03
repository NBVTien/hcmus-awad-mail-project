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
        
        // Optimistic update for both email list and email detail
        onMutate: async ({ emailId, isRead }) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ['emails'] });
            await queryClient.cancelQueries({ queryKey: ['email', emailId] });

            // Update email list cache
            const previousEmails = queryClient.getQueriesData({ queryKey: ['emails'] });
            previousEmails.forEach(([key]) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                queryClient.setQueryData(key, (old: any) => {
                    if (!old || !old.emails) return old;
                    return {
                        ...old,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        emails: old.emails.map((e: any) =>
                            e.id === emailId ? { ...e, isRead } : e
                        ),
                    };
                });
            });

            // Update email detail cache
            const previousDetail = queryClient.getQueryData(['email', emailId]);
            queryClient.setQueryData(['email', emailId], (old: any) => {
                if (!old) return old;
                return { ...old, isRead };
            });

            return { previousEmails, previousDetail };
        },

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (_err, { emailId }, context: any) => {
            // Rollback on error
            if (context?.previousEmails) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                context.previousEmails.forEach(([key, data]: any) => {
                    queryClient.setQueryData(key, data);
                });
            }
            if (context?.previousDetail) {
                queryClient.setQueryData(['email', emailId], context.previousDetail);
            }
            showError('Failed to update read status');
        },

        onSuccess: (_data, { emailId }) => {
            // Only invalidate mailboxes (for unread count)
            queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
            // Don't show toast for auto-mark-as-read
        },
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
