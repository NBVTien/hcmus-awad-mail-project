import { useQuery } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';
import { enhanceMailboxes } from '@/lib/mailboxHelpers';

export const useMailboxes = () => {
  return useQuery({
    queryKey: ['mailboxes'],
    queryFn: async () => {
      const response = await emailService.getMailboxes();
      // Enhance mailboxes with client-side icons and ordering
      return {
        ...response,
        mailboxes: enhanceMailboxes(response.mailboxes),
      };
    },
  });
};
