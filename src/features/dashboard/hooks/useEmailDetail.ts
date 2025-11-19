import { useQuery } from '@tanstack/react-query';
import { mockEmailService } from '@/services/mockEmailService';

export const useEmailDetail = (emailId: string | null) => {
  return useQuery({
    queryKey: ['email', emailId],
    queryFn: () => {
      if (!emailId) throw new Error('Email ID is required');
      return mockEmailService.getEmailById(emailId);
    },
    enabled: !!emailId,
  });
};
