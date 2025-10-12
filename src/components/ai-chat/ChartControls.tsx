import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Filter } from 'lucide-react';

interface ChartControlsProps {
  showFilter?: boolean;
  onToggleFilter?: () => void;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  showFilter,
  onToggleFilter
}) => {
  return (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        {/* Filter Toggle */}
        {showFilter && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleFilter}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Filters</TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};
