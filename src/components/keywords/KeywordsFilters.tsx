import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, RefreshCw, Grid3X3, List, Database } from 'lucide-react';

interface KeywordsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onRefresh?: () => void;
  onBackfillKeywords?: () => void;
}

export const KeywordsFilters: React.FC<KeywordsFiltersProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  onBackfillKeywords
}) => {
  return (
    <motion.div
      className="max-w-7xl mx-auto mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-background/60 backdrop-blur-xl border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-background/40 border-border/50"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-40 bg-background/40 border-border/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border/50 z-50">
                  <SelectItem value="usage_count">Most Used</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="recently_added">Recently Added</SelectItem>
                  <SelectItem value="cannibalization">Cannibalization</SelectItem>
                </SelectContent>
              </Select>

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

              {onBackfillKeywords && (
                <Button
                  variant="outline"
                  onClick={onBackfillKeywords}
                  className="bg-background/40 border-border/50 hover:bg-background/60"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Sync Keywords
                </Button>
              )}

              {onRefresh && (
                <Button
                  variant="outline"
                  onClick={onRefresh}
                  className="bg-background/40 border-border/50 hover:bg-background/60"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
