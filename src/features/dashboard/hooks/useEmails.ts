import { useQuery } from '@tanstack/react-query';
import { mockEmailService } from '@/services/mockEmailService';

export const useEmails = (mailboxId: string) => {
  return useQuery({
    queryKey: ['emails', mailboxId],
    queryFn: () => mockEmailService.getEmailsByMailbox(mailboxId),
    enabled: !!mailboxId,
  });
};
