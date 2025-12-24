import { useQuery } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';

/**
 * Hook for advanced search with criteria parsing
 */
export const useAdvancedSearch = (
  query: string,
  enabled: boolean = true,
  folder?: string
) => {
  return useQuery({
    queryKey: ['emails', 'advanced-search', query, folder],
    queryFn: () =>
      emailService.advancedSearch({
        query,
        folder,
        page: 1,
        limit: 50,
      }),
    enabled: enabled && query.trim().length > 0,
    staleTime: 30000, // 30 seconds
  });
};
