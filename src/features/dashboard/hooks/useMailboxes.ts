import { useQuery } from '@tanstack/react-query';
import { mockEmailService } from '@/services/mockEmailService';

export const useMailboxes = () => {
  return useQuery({
    queryKey: ['mailboxes'],
    queryFn: () => mockEmailService.getMailboxes(),
  });
};
