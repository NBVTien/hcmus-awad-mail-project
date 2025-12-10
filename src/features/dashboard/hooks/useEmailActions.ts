import { useMutation } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';
import { queryClient } from '@/lib/queryClient';
import { showSuccess, showError } from '@/lib/toast';
import type { GetEmailsResponse, Email } from '@/types/email.types';

interface StarContext {
    previous: [QueryKey, unknown][];
}

interface ReadContext {
    previousEmails: [QueryKey, unknown][];
    previousDetail: Email | undefined;
}

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
                queryClient.setQueryData(key, (old: GetEmailsResponse | undefined) => {
                    if (!old || !old.emails) return old;
                    return {
                        ...old,
                        emails: old.emails.map((e: Email) =>
                            e.id === emailId ? { ...e, isStarred } : e
                        ),
                    };
                });
            });

            return { previous };
        },

        onError: (_err, _vars, context: StarContext | undefined) => {
            // Rollback
            if (context?.previous) {
                context.previous.forEach(([key, data]) => {
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
                queryClient.setQueryData(key, (old: GetEmailsResponse | undefined) => {
                    if (!old || !old.emails) return old;
                    return {
                        ...old,
                        emails: old.emails.map((e: Email) =>
                            e.id === emailId ? { ...e, isRead } : e
                        ),
                    };
                });
            });

            // Update email detail cache
            const previousDetail = queryClient.getQueryData<Email>(['email', emailId]);
            queryClient.setQueryData(['email', emailId], (old: Email | undefined) => {
                if (!old) return old;
                return { ...old, isRead };
            });

            return { previousEmails, previousDetail };
        },

        onError: (_err, { emailId }, context: ReadContext | undefined) => {
            // Rollback on error
            if (context?.previousEmails) {
                context.previousEmails.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            if (context?.previousDetail) {
                queryClient.setQueryData(['email', emailId], context.previousDetail);
            }
            showError('Failed to update read status');
        },

        onSuccess: () => {
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
