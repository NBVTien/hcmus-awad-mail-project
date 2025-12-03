import { useQuery } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';

export const useEmails = (mailboxId: string, page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: ['emails', mailboxId, page, limit],
    queryFn: () => emailService.getEmailsByMailbox(mailboxId, { page, limit }),
    enabled: !!mailboxId,
  });
};
