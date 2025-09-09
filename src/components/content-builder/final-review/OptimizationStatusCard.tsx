import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  RotateCcw,
  TrendingUp,
  Target
} from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { motion } from 'framer-motion';

interface OptimizationStatusCardProps {
  onViewOptimizations?: () => void;
  onReOptimize?: () => void;
}

export const OptimizationStatusCard: React.FC<OptimizationStatusCardProps> = ({
  onViewOptimizations,
  onReOptimize
}) => {
  const { state, getOptimizationSelections } = useContentBuilder();
  const optimizationData = getOptimizationSelections();

  if (!optimizationData) {
    return (
      <Card className="border-l-4 border-l-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            Content Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    );
  }

  const { suggestions, highlights } = optimizationData;
  const totalOptimizations = suggestions.length + highlights.length;
  const completionPercentage = totalOptimizations > 0 ? 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Content Optimization Status
            </CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Progress Overview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Optimization Progress</span>
              <span className="font-medium">{totalOptimizations} optimizations applied</span>
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
                <span className="text-xs font-medium">Content Highlights</span>
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
              The changes have been integrated and saved.
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
        </CardContent>
      </Card>
    </motion.div>
  );
};