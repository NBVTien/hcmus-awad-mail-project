import { useState, useEffect } from 'react';

export type SearchMode = 'normal' | 'advanced';

const SEARCH_MODE_KEY = 'search-mode-preference';

/**
 * Hook to manage search mode preference with localStorage persistence
 *
 * @returns Current search mode and function to update it
 */
export const useSearchMode = () => {
  const [searchMode, setSearchModeState] = useState<SearchMode>(() => {
    const saved = localStorage.getItem(SEARCH_MODE_KEY);
    return (saved as SearchMode) || 'normal';
  });

  useEffect(() => {
    localStorage.setItem(SEARCH_MODE_KEY, searchMode);
  }, [searchMode]);

  const setSearchMode = (mode: SearchMode) => {
    setSearchModeState(mode);
  };

  return { searchMode, setSearchMode };
};

/**
 * Get the current search mode from localStorage without using a hook
 * Useful for non-component code
 */
export const getSearchMode = (): SearchMode => {
  const saved = localStorage.getItem(SEARCH_MODE_KEY);
  return (saved as SearchMode) || 'normal';
};
