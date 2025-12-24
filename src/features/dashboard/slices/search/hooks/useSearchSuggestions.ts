import { useQuery } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';

interface SearchSuggestion {
  type: 'contact' | 'subject' | 'recent';
  value: string;
  display: string;
}

/**
 * Hook to get search suggestions based on partial query
 * Returns suggestions from:
 * - Recent senders (contacts)
 * - Subject keywords
 * - Recent searches (from localStorage)
 */
export const useSearchSuggestions = (query: string) => {
  const RECENT_SEARCHES_KEY = 'recent-email-searches';
  const MAX_RECENT_SEARCHES = 5;

  // Get recent searches from localStorage
  const getRecentSearches = (): string[] => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Save a search query to recent searches
  const saveRecentSearch = (searchQuery: string) => {
    try {
      const recent = getRecentSearches();
      const updated = [
        searchQuery,
        ...recent.filter((q) => q !== searchQuery),
      ].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  // Fetch email list to extract contacts and subjects
  const { data: emails } = useQuery({
    queryKey: ['emails', 'INBOX', 1],
    queryFn: () => emailService.getEmailsByMailbox('INBOX', { page: 1, limit: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getSuggestions = (): SearchSuggestion[] => {
    if (!query || query.length < 2) {
      // Show recent searches when query is short
      const recent = getRecentSearches();
      return recent.map((value) => ({
        type: 'recent',
        value,
        display: value,
      }));
    }

    const suggestions: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();
    const seen = new Set<string>();

    // Extract unique contacts (senders)
    if (emails?.emails) {
      const contacts = emails.emails
        .map((email) => ({
          name: email.from.name || email.from.email,
          email: email.from.email,
        }))
        .filter((contact) => {
          const matchesQuery =
            contact.name.toLowerCase().includes(queryLower) ||
            contact.email.toLowerCase().includes(queryLower);
          const notSeen = !seen.has(contact.email);
          if (matchesQuery && notSeen) {
            seen.add(contact.email);
            return true;
          }
          return false;
        })
        .slice(0, 3);

      suggestions.push(
        ...contacts.map((contact) => ({
          type: 'contact' as const,
          value: contact.email,
          display: `${contact.name} <${contact.email}>`,
        }))
      );
    }

    // Extract subject keywords
    if (emails?.emails) {
      const subjects = emails.emails
        .map((email) => email.subject)
        .filter((subject) => {
          const matchesQuery = subject.toLowerCase().includes(queryLower);
          const notSeen = !seen.has(subject);
          if (matchesQuery && notSeen && subject.length > 0) {
            seen.add(subject);
            return true;
          }
          return false;
        })
        .slice(0, 2);

      suggestions.push(
        ...subjects.map((subject) => ({
          type: 'subject' as const,
          value: subject,
          display: subject,
        }))
      );
    }

    // Add matching recent searches
    const recentMatches = getRecentSearches()
      .filter((recent) => {
        const matchesQuery = recent.toLowerCase().includes(queryLower);
        const notSeen = !seen.has(recent);
        if (matchesQuery && notSeen) {
          seen.add(recent);
          return true;
        }
        return false;
      })
      .slice(0, 2);

    suggestions.push(
      ...recentMatches.map((value) => ({
        type: 'recent' as const,
        value,
        display: value,
      }))
    );

    return suggestions.slice(0, 5);
  };

  return {
    suggestions: getSuggestions(),
    saveRecentSearch,
  };
};
