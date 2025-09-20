import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { AdvancedFiltersModal } from './AdvancedFiltersModal';
import { motion } from 'framer-motion';

interface RepositoryControlsProps {
  onFiltersApply: (filters: any) => void;
  contentStats: any;
}

export const RepositoryControls: React.FC<RepositoryControlsProps> = ({
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