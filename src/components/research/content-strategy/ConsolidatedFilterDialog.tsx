import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Calendar, Archive, Play, Grid, List, Users, Target, TreePine, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { type ProposalStatus } from '@/services/proposalStatusService';
import { DateRange } from 'react-day-picker';

interface ConsolidatedFilterState {
  statuses: ProposalStatus[];
  categories: string[];
  dateRange?: DateRange;
}

interface ConsolidatedFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ConsolidatedFilterState;
  onFiltersChange: (filters: ConsolidatedFilterState) => void;
  statusCounts: Record<ProposalStatus, number>;
  categoryCounts: Record<string, number>;
}

export const ConsolidatedFilterDialog: React.FC<ConsolidatedFilterDialogProps> = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  statusCounts,
  categoryCounts
}) => {
  const statusConfig = {
    available: { label: 'Available', icon: Play, className: 'text-blue-400' },
    scheduled: { label: 'Scheduled', icon: Calendar, className: 'text-purple-400' },
    in_progress: { label: 'In Progress', icon: Clock, className: 'text-yellow-400' },
    completed: { label: 'Completed', icon: CheckCircle2, className: 'text-green-400' },
    archived: { label: 'Archived', icon: Archive, className: 'text-gray-400' }
  };

  const categoryConfig = {
    all: { label: 'All Proposals', icon: Grid, className: 'text-white' },
    selected: { label: 'Selected', icon: Users, className: 'text-yellow-400' },
    quick_win: { label: 'Quick Wins', icon: Target, className: 'text-green-400' },
    high_return: { label: 'High Return', icon: TrendingUp, className: 'text-blue-400' },
    evergreen: { label: 'Evergreen', icon: TreePine, className: 'text-purple-400' }
  };

  const handleStatusToggle = (status: ProposalStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleReset = () => {
    onFiltersChange({ statuses: [], categories: [], dateRange: undefined });
  };

  const getActiveFilterCount = () => {
    return filters.statuses.length + filters.categories.length + (filters.dateRange ? 1 : 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-sm border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filter Proposals</span>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-foreground">Status</h3>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(statusConfig) as ProposalStatus[]).map((status) => {
                const config = statusConfig[status];
                const Icon = config.icon;
                const count = statusCounts[status] || 0;
                const isSelected = filters.statuses.includes(status);
                
                return (
                  <div key={status} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50">
                    <Checkbox
                      id={`status-${status}`}
                      checked={isSelected}
                      onCheckedChange={() => handleStatusToggle(status)}
                    />
                    <label 
                      htmlFor={`status-${status}`}
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                    >
                      <Icon className={`h-4 w-4 ${config.className}`} />
                      <span className="text-sm">{config.label}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {count}
                      </Badge>
                    </label>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Category Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-foreground">Category</h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(categoryConfig).map(([category, config]) => {
                const Icon = config.icon;
                const count = categoryCounts[category] || 0;
                const isSelected = filters.categories.includes(category);
                
                return (
                  <div key={category} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50">
                    <Checkbox
                      id={`category-${category}`}
                      checked={isSelected}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <label 
                      htmlFor={`category-${category}`}
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                    >
                      <Icon className={`h-4 w-4 ${config.className}`} />
                      <span className="text-sm">{config.label}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {count}
                      </Badge>
                    </label>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Date Range Filter */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-foreground">Date Range</h3>
            <DatePickerWithRange
              date={filters.dateRange}
              onDateChange={(date) => onFiltersChange({ ...filters, dateRange: date })}
              className="w-full"
            />
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={getActiveFilterCount() === 0}
          >
            Reset All
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};