import { useMutation } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';
import { queryClient } from '@/lib/queryClient';
import { showSuccess, showError } from '@/lib/toast';

export function useCompose() {
    const sendEmail = useMutation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: (draft: any) => emailService.sendEmail(draft),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emails', 'sent'] });
            queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
            showSuccess('Email sent');
        },
        onError: () => showError('Failed to send email'),
    });

    return { sendEmail };
}
