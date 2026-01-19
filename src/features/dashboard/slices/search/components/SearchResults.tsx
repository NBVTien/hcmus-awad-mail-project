import { Loader2, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmailList } from '@/features/dashboard/slices/email-list/components';
import type { Email } from '@/types/email.types';

interface SearchResultsProps {
  query: string;
  results: Email[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onEmailSelect: (emailId: string) => void;
  selectedEmailId: string | null;
  onBack: () => void;
  onRetry: () => void;
  isMobile?: boolean;
}

export const SearchResults = ({
  query,
  results,
  isLoading,
  isError,
  error,
  onEmailSelect,
  selectedEmailId,
  onBack,
  onRetry,
}: SearchResultsProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h2 className="text-sm font-medium">
            Search Results for "{query}"
          </h2>
          {results && (
            <p className="text-xs text-muted-foreground">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-hidden">
        {isLoading && (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 max-w-md text-center">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Search Failed</h3>
                <p className="text-sm text-muted-foreground">
                  {error?.message || 'An error occurred while searching'}
                </p>
              </div>
              <Button onClick={onRetry} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !isError && results && results.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 max-w-md text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium mb-1">No Results Found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search query or search terms
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !isError && results && results.length > 0 && (
          <EmailList
            emails={results}
            selectedEmailId={selectedEmailId}
            onSelectEmail={onEmailSelect}
            isLoading={false}
            showCheckboxes={false}
          />
        )}
      </div>
    </div>
  );
};
