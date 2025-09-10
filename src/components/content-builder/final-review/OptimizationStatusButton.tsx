import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Sparkles, 
  RotateCcw,
  Target
} from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

interface OptimizationStatusButtonProps {
  onClick: () => void;
}

export const OptimizationStatusButton: React.FC<OptimizationStatusButtonProps> = ({
  onClick
}) => {
  const { getOptimizationSelections } = useContentBuilder();
  const optimizationData = getOptimizationSelections();

  // No optimizations state
  if (!optimizationData) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onClick}
        className="gap-2 w-full justify-start"
      >
        <Sparkles className="w-4 h-4 text-muted-foreground" />
        Optimize Content
      </Button>
    );
  }

  const { suggestions, highlights } = optimizationData;
  const totalOptimizations = suggestions.length + highlights.length;

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick}
      className="gap-2 w-full justify-between border-primary/20 hover:border-primary/40"
    >
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-primary" />
        <span>Optimizations</span>
      </div>
      <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
        {totalOptimizations}
      </Badge>
    </Button>
  );
};