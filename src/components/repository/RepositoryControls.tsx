import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Grid3X3, List } from 'lucide-react';
import { AdvancedFiltersModal } from './AdvancedFiltersModal';
import { motion } from 'framer-motion';

export type ViewMode = 'grid' | 'list';

interface RepositoryControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onFiltersApply: (filters: any) => void;
  contentStats: any;
}

export const RepositoryControls: React.FC<RepositoryControlsProps> = ({
  viewMode,
  onViewModeChange,
  onFiltersApply,
  contentStats
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <>
      <motion.div 
        className="flex justify-end items-center gap-2 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Advanced Filters Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedFilters(true)}
          className="glass-button bg-background/40 backdrop-blur-sm border-white/10 hover:border-white/20 hover:bg-background/60"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-white/10 rounded-lg bg-background/40 backdrop-blur-sm p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={`h-8 px-3 ${
              viewMode === 'grid' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'hover:bg-background/60'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={`h-8 px-3 ${
              viewMode === 'list' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'hover:bg-background/60'
            }`}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <AdvancedFiltersModal
        open={showAdvancedFilters}
        onOpenChange={setShowAdvancedFilters}
        onFiltersApply={onFiltersApply}
        contentStats={contentStats}
      />
    </>
  );
};