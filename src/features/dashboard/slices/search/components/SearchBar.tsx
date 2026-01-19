import { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, Mail, FileText, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { cn } from '@/lib/utils';

export interface SearchFilters {
  isRead?: boolean; // false for unread only
  hasAttachment?: boolean;
}

interface SearchBarProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  onClear: () => void;
}

export const SearchBar = ({ onSearch, onClear }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Filter states
  // We use slightly different internal state to map to UI checkboxes
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [hasAttachment, setHasAttachment] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { suggestions, saveRecentSearch } = useSearchSuggestions(query);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilters = (): SearchFilters => {
    const f: SearchFilters = {};
    if (unreadOnly) f.isRead = false;
    if (hasAttachment) f.hasAttachment = true;
    return f;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      onSearch(query.trim(), getFilters());
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setIsFilterOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setUnreadOnly(false);
    setHasAttachment(false);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onClear();
  };

  const handleSelectSuggestion = (value: string) => {
    setQuery(value);
    saveRecentSearch(value);
    // When selecting suggestion, apply current filters too
    onSearch(value, getFilters());
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (showSuggestions) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      } else {
        handleClear();
      }
      return;
    }

    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex].value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (query.length >= 0) {
      setShowSuggestions(true);
    }
  };

  // Apply filters immediately if specific requirement says "when complete filter", 
  // but usually in search bar we prefer "Apply" or just re-search if query exists.
  // User said "khi hoàn tát filter thì sẽ gửi request search".
  // So maybe a button "Apply Filters" inside popover?
  // Let's implement Apply button in Popover.

  const handleApplyFilters = () => {
    const filters = getFilters();
    const hasActiveFilters = Object.keys(filters).length > 0;

    if (query.trim() || hasActiveFilters) {
      if (query.trim()) {
        saveRecentSearch(query.trim());
      }
      onSearch(query.trim(), filters);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setIsFilterOpen(false);
    } else {
      console.warn('SearchBar: Query is empty and no filters selected');
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'contact':
        return <Mail className="h-4 w-4" />;
      case 'subject':
        return <FileText className="h-4 w-4" />;
      case 'recent':
        return <Clock className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const activeFilterCount = (unreadOnly ? 1 : 0) + (hasAttachment ? 1 : 0);

  return (
    <div className="flex items-center gap-2 flex-1 max-w-md relative">
      <form onSubmit={handleSubmit} className="relative flex-1">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search emails..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          className="pl-8 pr-20 h-9"
          autoComplete="off"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0"
              title="Clear search (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!query.trim()}
            className="h-7 px-3"
            title="Search (Enter)"
          >
            Search
          </Button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion.value)}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2',
                  selectedIndex === index && 'bg-accent'
                )}
              >
                <span className="text-muted-foreground flex-shrink-0">
                  {getSuggestionIcon(suggestion.type)}
                </span>
                <span className="truncate flex-1">{suggestion.display}</span>
                {suggestion.type === 'recent' && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">Recent</span>
                )}
              </button>
            ))}
          </div>
        )}
      </form>

      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className={cn("h-9 w-9 shrink-0", activeFilterCount > 0 && "border-primary text-primary bg-primary/10")}>
            <Filter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-4" align="end">
          <div className="space-y-4">
            <h4 className="font-medium leading-none">Filters</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter-unread"
                  checked={unreadOnly}
                  onCheckedChange={(c) => setUnreadOnly(!!c)}
                />
                <Label htmlFor="filter-unread" className="text-sm font-normal cursor-pointer">Unread only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter-attachment"
                  checked={hasAttachment}
                  onCheckedChange={(c) => setHasAttachment(!!c)}
                />
                <Label htmlFor="filter-attachment" className="text-sm font-normal cursor-pointer">Has attachment</Label>
              </div>
            </div>
            <Button type="button" className="w-full" size="sm" onClick={handleApplyFilters}>Apply Filters</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
