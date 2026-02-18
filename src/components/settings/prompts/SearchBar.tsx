import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Sparkles, Plus } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalFormats: number;
  configuredFormats: number;
  filteredCount: number;
  onCreateAll: () => void;
  onEnhanceAll: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  totalFormats,
  configuredFormats,
  filteredCount,
  onCreateAll,
  onEnhanceAll,
}) => {
  const progress = totalFormats > 0 ? (configuredFormats / totalFormats) * 100 : 0;
  const hasUnconfigured = configuredFormats < totalFormats;

  return (
    <div className="space-y-4">
      {/* Search and Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search formats..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {configuredFormats}/{totalFormats} configured
            </Badge>
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-foreground transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        {hasUnconfigured && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateAll}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Create All Missing
          </Button>
        )}
        
        {configuredFormats > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEnhanceAll}
            className="text-xs"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Enhance All
          </Button>
        )}

        {searchQuery && (
          <Badge variant="secondary" className="text-xs">
            {filteredCount} result{filteredCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default SearchBar;