import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, RefreshCw, Grid3X3, List } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
}

interface EngageFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  sortOptions?: SortOption[];
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onRefresh?: () => void;
  extraActions?: React.ReactNode;
}

export const EngageFilterBar: React.FC<EngageFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  sortBy,
  onSortChange,
  sortOptions,
  viewMode,
  onViewModeChange,
  onRefresh,
  extraActions,
}) => {
  return (
    <motion.div
      className="max-w-7xl mx-auto mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-background/60 backdrop-blur-xl border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-background/40 border-border/50"
              />
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              {sortBy !== undefined && onSortChange && sortOptions && (
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger className="w-40 bg-background/40 border-border/50">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border/50 z-50">
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {viewMode !== undefined && onViewModeChange && (
                <div className="flex gap-1 p-1 bg-background/40 rounded-lg border border-border/50">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="bg-background/40 border-border/50 hover:bg-background/60"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}

              {extraActions}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
