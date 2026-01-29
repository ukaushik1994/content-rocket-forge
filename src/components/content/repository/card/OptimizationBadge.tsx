import React from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface OptimizationBadgeProps {
  count: number;
}

export const OptimizationBadge: React.FC<OptimizationBadgeProps> = ({ count }) => {
  if (count <= 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className="bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 cursor-pointer transition-colors"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          {count} {count === 1 ? 'improvement' : 'improvements'}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">AI has {count} suggested {count === 1 ? 'improvement' : 'improvements'} for this content</p>
      </TooltipContent>
    </Tooltip>
  );
};
