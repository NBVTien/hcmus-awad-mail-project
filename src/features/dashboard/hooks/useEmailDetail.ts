import { useQuery } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';

export const useEmailDetail = (emailId: string | null) => {
  return useQuery({
    queryKey: ['email', emailId],
    queryFn: () => {
      if (!emailId) throw new Error('Email ID is required');
      return emailService.getEmailById(emailId);
    },
    enabled: !!emailId,
  });
};
