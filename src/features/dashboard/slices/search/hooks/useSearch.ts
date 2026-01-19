import { useQuery } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';
import { getSearchMode } from '@/hooks/useSearchMode';

export const useSearch = (
  query: string,
  enabled: boolean = true,
  filters?: { isRead?: boolean; hasAttachment?: boolean }
) => {
  // Get the current search mode from localStorage
  const searchMode = getSearchMode();

  return useQuery({
    queryKey: ['emails', 'search', query, searchMode, filters],
    queryFn: () => {
      return emailService.searchEmails(query, searchMode, filters);
    },
    enabled: enabled && (query.trim().length > 0 || (!!filters && (filters.isRead !== undefined || filters.hasAttachment !== undefined))),
    staleTime: 30000, // 30 seconds
  });
};
