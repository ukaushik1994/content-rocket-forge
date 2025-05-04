
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  CalendarDays, 
  SlidersHorizontal, 
  X, 
  Check,
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface EnhancedContentFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  keywordFilter: string;
  setKeywordFilter: (value: string) => void;
  appliedFilters: string[];
  clearFilters: () => void;
  clearFilter: (filter: string) => void;
}

export const EnhancedContentFilters: React.FC<EnhancedContentFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  dateRange,
  setDateRange,
  keywordFilter,
  setKeywordFilter,
  appliedFilters,
  clearFilters,
  clearFilter
}) => {
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              className="pl-9 bg-glass border-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1 h-8 w-8 opacity-70 hover:opacity-100" 
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-glass border-white/10 w-[160px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className={isAdvancedFilterOpen ? 'bg-primary text-primary-foreground' : ''}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-sm p-0" align="start">
              <div className="p-4 pb-2">
                <div className="font-medium mb-3 flex items-center justify-between">
                  <span>Advanced Filters</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs" 
                    onClick={clearFilters}
                  >
                    Clear all
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {/* Date Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left text-xs font-normal"
                            disabled={!dateRange.from}
                          >
                            <CalendarDays className="mr-2 h-3.5 w-3.5" />
                            {dateRange.from ? format(dateRange.from, 'MMM dd, yyyy') : 'From date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left text-xs font-normal"
                            disabled={!dateRange.to}
                          >
                            <CalendarDays className="mr-2 h-3.5 w-3.5" />
                            {dateRange.to ? format(dateRange.to, 'MMM dd, yyyy') : 'To date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                            fromDate={dateRange.from}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {(dateRange.from || dateRange.to) && (
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">
                          {dateRange.from && dateRange.to
                            ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`
                            : dateRange.from
                            ? `From ${format(dateRange.from, 'MMM d, yyyy')}`
                            : `Until ${format(dateRange.to!, 'MMM d, yyyy')}`}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 text-xs p-0"
                          onClick={() => setDateRange({ from: undefined, to: undefined })}
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Keyword Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Keyword Filter</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Filter by keyword..."
                        value={keywordFilter}
                        onChange={(e) => setKeywordFilter(e.target.value)}
                        className="text-sm"
                      />
                      {keywordFilter && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => setKeywordFilter('')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Filter content that contains specific keywords
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-muted/30 px-4 py-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAdvancedFilterOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="gap-1"
                  onClick={() => setIsAdvancedFilterOpen(false)}
                >
                  <Check className="h-3.5 w-3.5" />
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-glass border-white/10 w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="title">Sort by Title</SelectItem>
              <SelectItem value="score">Sort by SEO Score</SelectItem>
              <SelectItem value="wordCount">Sort by Word Count</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Applied filters display */}
      {appliedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">Applied filters:</span>
          {appliedFilters.map((filter) => (
            <Badge 
              key={filter} 
              variant="secondary" 
              className="flex items-center gap-1 pl-2 hover:bg-secondary/80"
            >
              {filter}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 ml-1"
                onClick={() => clearFilter(filter)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          <Button
            variant="link"
            className="text-xs h-auto p-0"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};
