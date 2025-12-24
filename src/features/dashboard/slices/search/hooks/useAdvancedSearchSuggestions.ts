import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { emailService } from '@/services/emailService';

interface AdvancedSuggestion {
  type: 'from' | 'to' | 'subject' | 'keyword';
  value: string;
  display: string;
}

/**
 * Hook for advanced search autocomplete suggestions
 * Detects search criteria (from:, to:, subject:) and provides context-aware suggestions
 */
export const useAdvancedSearchSuggestions = (query: string) => {
  const [criteriaType, setCriteriaType] = useState<'from' | 'to' | 'subject' | null>(null);
  const [criteriaQuery, setCriteriaQuery] = useState<string>('');

  // Parse the query to detect if user is typing a criterion
  useEffect(() => {
    // Match patterns like "from:jo", "to:te", "subject:mee"
    const fromMatch = query.match(/from:([^\s]*)$/);
    const toMatch = query.match(/to:([^\s]*)$/);
    const subjectMatch = query.match(/subject:([^\s]*)$/);

    if (fromMatch) {
      setCriteriaType('from');
      setCriteriaQuery(fromMatch[1]);
    } else if (toMatch) {
      setCriteriaType('to');
      setCriteriaQuery(toMatch[1]);
    } else if (subjectMatch) {
      setCriteriaType('subject');
      setCriteriaQuery(subjectMatch[1]);
    } else {
      setCriteriaType(null);
      setCriteriaQuery('');
    }
  }, [query]);

  // Fetch sender suggestions
  const { data: senderSuggestions } = useQuery({
    queryKey: ['sender-suggestions', criteriaQuery],
    queryFn: () => emailService.getSenderSuggestions(criteriaQuery, 5),
    enabled: criteriaType === 'from' && criteriaQuery.length >= 1,
    staleTime: 60000, // 1 minute
  });

  // Fetch recipient suggestions
  const { data: recipientSuggestions } = useQuery({
    queryKey: ['recipient-suggestions', criteriaQuery],
    queryFn: () => emailService.getRecipientSuggestions(criteriaQuery, 5),
    enabled: criteriaType === 'to' && criteriaQuery.length >= 1,
    staleTime: 60000,
  });

  // Fetch subject suggestions
  const { data: subjectSuggestions } = useQuery({
    queryKey: ['subject-suggestions', criteriaQuery],
    queryFn: () => emailService.getSubjectSuggestions(criteriaQuery, 5),
    enabled: criteriaType === 'subject' && criteriaQuery.length >= 2,
    staleTime: 60000,
  });

  // Transform suggestions to common format
  const getSuggestions = (): AdvancedSuggestion[] => {
    if (criteriaType === 'from' && senderSuggestions) {
      return senderSuggestions.map((s) => ({
        type: 'from' as const,
        value: `from:${s.email}`,
        display: s.displayText,
      }));
    }

    if (criteriaType === 'to' && recipientSuggestions) {
      return recipientSuggestions.map((s) => ({
        type: 'to' as const,
        value: `to:${s.email}`,
        display: s.displayText,
      }));
    }

    if (criteriaType === 'subject' && subjectSuggestions) {
      return subjectSuggestions.map((s) => ({
        type: 'subject' as const,
        value: `subject:${s.subject}`,
        display: s.displayText,
      }));
    }

    // Show keyword suggestions when no criterion is active
    if (!criteriaType && query.trim()) {
      return [
        { type: 'keyword' as const, value: `from:${query}`, display: `Search from: ${query}` },
        { type: 'keyword' as const, value: `to:${query}`, display: `Search to: ${query}` },
        { type: 'keyword' as const, value: `subject:${query}`, display: `Search subject: ${query}` },
        { type: 'keyword' as const, value: `contains:${query}`, display: `Contains: ${query}` },
      ];
    }

    return [];
  };

  return {
    suggestions: getSuggestions(),
    criteriaType,
    hasSuggestions: getSuggestions().length > 0,
  };
};
