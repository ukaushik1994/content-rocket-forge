import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  CheckSquare, 
  Square, 
  Zap, 
  Target, 
  Clock, 
  TrendingUp,
  Sparkles,
  Filter
} from 'lucide-react';
import { useBulkSelection, SelectionCriteria } from '../hooks/useBulkSelection';

interface BulkSelectionControlsProps {
  bulkSelection: ReturnType<typeof useBulkSelection>;
  className?: string;
}

export function BulkSelectionControls({ bulkSelection, className = '' }: BulkSelectionControlsProps) {
  const { 
    selectedSuggestions, 
    selectionStats, 
    selectByCriteria, 
    selectSmartRecommendations,
    isAllSelected, 
    isNoneSelected,
    getEstimatedImpact 
  } = bulkSelection;

  const impact = getEstimatedImpact();

  const handleCriteriaSelect = (criteria: string) => {
    selectByCriteria(criteria as SelectionCriteria);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selection Overview */}
      <div className="flex items-center justify-between p-4 bg-background/40 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isAllSelected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {selectedSuggestions.length} / {selectionStats.total} selected
            </span>
          </div>
          
          {selectedSuggestions.length > 0 && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Impact: {impact.impact.toFixed(1)}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                ~{Math.round(impact.estimatedTime / 60)}m
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectByCriteria('all')}
            disabled={isAllSelected}
            className="text-xs"
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectByCriteria('none')}
            disabled={isNoneSelected}
            className="text-xs"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Quick Selection Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={selectSmartRecommendations}
          className="flex items-center gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          Smart Select
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => selectByCriteria('auto_fixable')}
          className="flex items-center gap-2"
        >
          <Zap className="h-4 w-4" />
          Auto-fixable ({selectionStats.autoFixable})
        </Button>
      </div>

      {/* Priority Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          <Filter className="h-3 w-3" />
          Select by Priority
        </label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectByCriteria('high_priority')}
            className="flex items-center gap-2 text-xs"
          >
            <Badge variant="destructive" className="h-2 w-2 p-0" />
            High ({selectionStats.highPriority})
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectByCriteria('medium_priority')}
            className="flex items-center gap-2 text-xs"
          >
            <Badge variant="secondary" className="h-2 w-2 p-0 bg-amber-500" />
            Medium ({selectionStats.mediumPriority})
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectByCriteria('low_priority')}
            className="flex items-center gap-2 text-xs"
          >
            <Badge variant="outline" className="h-2 w-2 p-0" />
            Low ({selectionStats.lowPriority})
          </Button>
        </div>
      </div>

      {/* Category Selection */}
      {Object.keys(selectionStats.byCategory).length > 1 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Select by Category
          </label>
          <Select onValueChange={handleCriteriaSelect}>
            <SelectTrigger className="text-xs h-8">
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(selectionStats.byCategory).map(([category, count]) => (
                <SelectItem key={category} value={`category:${category}`} className="text-xs">
                  <div className="flex items-center justify-between w-full">
                    <span className="capitalize">{category.replace('_', ' ')}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {count}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Selection Statistics */}
      {selectedSuggestions.length > 0 && (
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-xs font-medium text-primary mb-2">Selection Impact</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Efficiency:</span>
              <span className="font-medium">{impact.efficiency.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Time:</span>
              <span className="font-medium">{Math.round(impact.estimatedTime / 60)}m</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}