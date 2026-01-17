import { useQuery } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';
import { getSearchMode } from '@/hooks/useSearchMode';

export const useSearch = (query: string, enabled: boolean = true) => {
  // Get the current search mode from localStorage
  const searchMode = getSearchMode();

  return useQuery({
    queryKey: ['emails', 'search', query, searchMode],
    queryFn: () => emailService.searchEmails(query, searchMode),
    enabled: enabled && query.trim().length > 0,
    staleTime: 30000, // 30 seconds
  });
};
