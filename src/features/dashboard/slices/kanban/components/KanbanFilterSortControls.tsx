import { Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export type SortOrder = 'newest' | 'oldest';

export interface KanbanFilters {
  unreadOnly: boolean;
  attachmentsOnly: boolean;
}

interface KanbanFilterSortControlsProps {
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  filters: KanbanFilters;
  onFiltersChange: (filters: KanbanFilters) => void;
}

export const KanbanFilterSortControls = ({
  sortOrder,
  onSortChange,
  filters,
  onFiltersChange,
}: KanbanFilterSortControlsProps) => {
  const hasActiveFilters = filters.unreadOnly || filters.attachmentsOnly;

  return (
    <div className="flex items-center gap-2">
      {/* Sort Controls */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Sort: {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="end">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Sort by Date</h4>
            <Separator />
            <div className="space-y-2">
              <button
                onClick={() => onSortChange('newest')}
                className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-accent ${
                  sortOrder === 'newest' ? 'bg-accent' : ''
                }`}
              >
                Newest First
              </button>
              <button
                onClick={() => onSortChange('oldest')}
                className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-accent ${
                  sortOrder === 'oldest' ? 'bg-accent' : ''
                }`}
              >
                Oldest First
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Filter Controls */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
            {hasActiveFilters && (
              <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Filter Emails</h4>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unread-only"
                  checked={filters.unreadOnly}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ ...filters, unreadOnly: checked === true })
                  }
                />
                <Label
                  htmlFor="unread-only"
                  className="text-sm font-normal cursor-pointer"
                >
                  Show only unread
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="attachments-only"
                  checked={filters.attachmentsOnly}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ ...filters, attachmentsOnly: checked === true })
                  }
                />
                <Label
                  htmlFor="attachments-only"
                  className="text-sm font-normal cursor-pointer"
                >
                  Show only with attachments
                </Label>
              </div>
            </div>
            {hasActiveFilters && (
              <>
                <Separator />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    onFiltersChange({ unreadOnly: false, attachmentsOnly: false })
                  }
                >
                  Clear Filters
                </Button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
