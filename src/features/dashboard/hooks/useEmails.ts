import { useQuery } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';

export const useEmails = (mailboxId: string) => {
  return useQuery({
    queryKey: ['emails', mailboxId],
    queryFn: () => emailService.getEmailsByMailbox(mailboxId),
    enabled: !!mailboxId,
  });
};
