import { useQuery } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';

export const useSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['emails', 'search', query],
    queryFn: () => emailService.searchEmails(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 30000, // 30 seconds
  });
};
