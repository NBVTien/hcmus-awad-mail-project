import { useEffect, useCallback } from 'react';

interface UseKeyboardNavProps {
  items: Array<{ id: string }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClear?: () => void;
  enabled?: boolean;
}

export const useKeyboardNav = ({
  items,
  selectedId,
  onSelect,
  onClear,
  enabled = true,
}: UseKeyboardNavProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || items.length === 0) return;

      const currentIndex = selectedId ? items.findIndex((item) => item.id === selectedId) : -1;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (currentIndex < items.length - 1) {
            onSelect(items[currentIndex + 1].id);
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          if (currentIndex > 0) {
            onSelect(items[currentIndex - 1].id);
          }
          break;

        case 'Enter':
          event.preventDefault();
          if (currentIndex >= 0) {
            onSelect(items[currentIndex].id);
          } else if (items.length > 0) {
            onSelect(items[0].id);
          }
          break;

        case 'Escape':
          event.preventDefault();
          onClear?.();
          break;

        default:
          break;
      }
    },
    [items, selectedId, onSelect, onClear, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
};
