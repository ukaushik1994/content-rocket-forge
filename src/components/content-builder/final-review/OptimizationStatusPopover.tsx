import React from 'react';
import { PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  RotateCcw,
  TrendingUp,
  Target
} from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { motion } from 'framer-motion';

interface OptimizationStatusPopoverProps {
  onViewOptimizations?: () => void;
  onReOptimize?: () => void;
}

export const OptimizationStatusPopover: React.FC<OptimizationStatusPopoverProps> = ({
  onViewOptimizations,
  onReOptimize
}) => {
  const { getOptimizationSelections } = useContentBuilder();
  const optimizationData = getOptimizationSelections();

  if (!optimizationData) {
    return (
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-medium">Content Optimization</h4>
          </div>
          
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              No optimizations applied yet
            </p>
            <Button size="sm" onClick={onReOptimize} className="gap-2">
              <Sparkles className="w-3 h-3" />
              Start Optimization
            </Button>
          </div>
        </div>
      </PopoverContent>
    );
  }

  const { suggestions, highlights } = optimizationData;
  const totalOptimizations = suggestions.length + highlights.length;
  const completionPercentage = totalOptimizations > 0 ? 100 : 0;

  return (
    <PopoverContent className="w-80">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <h4 className="font-medium">Optimization Status</h4>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Active
          </Badge>
        </div>

        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{totalOptimizations} applied</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Optimization Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium">Suggestions</span>
            </div>
            <div className="text-lg font-bold text-blue-600">{suggestions.length}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3 text-purple-500" />
              <span className="text-xs font-medium">Highlights</span>
            </div>
            <div className="text-lg font-bold text-purple-600">{highlights.length}</div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="bg-primary/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Optimization Complete</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Your content has been optimized with {totalOptimizations} improvements.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          {onViewOptimizations && (
            <Button size="sm" variant="outline" onClick={onViewOptimizations} className="gap-2 flex-1">
              <Eye className="w-3 h-3" />
              View Applied
            </Button>
          )}
          {onReOptimize && (
            <Button size="sm" variant="outline" onClick={onReOptimize} className="gap-2 flex-1">
              <RotateCcw className="w-3 h-3" />
              Re-optimize
            </Button>
          )}
        </div>
      </motion.div>
    </PopoverContent>
  );
};