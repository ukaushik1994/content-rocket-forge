import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Target } from 'lucide-react';

interface ProposalValidationBadgeProps {
  predicted: number;
  actual: number;
  accuracy: number;
}

export const ProposalValidationBadge: React.FC<ProposalValidationBadgeProps> = ({ predicted, actual, accuracy }) => {
  const color = accuracy >= 80 ? 'text-emerald-400' : accuracy >= 50 ? 'text-amber-400' : 'text-rose-400';
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={`text-[9px] gap-1 ${color} border-current/20`}>
          <Target className="h-2.5 w-2.5" />
          {Math.round(accuracy)}%
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs font-medium">Prediction Accuracy: {Math.round(accuracy)}%</p>
        <p className="text-[10px] text-muted-foreground">Predicted {predicted.toLocaleString()} → Actual {actual.toLocaleString()}</p>
      </TooltipContent>
    </Tooltip>
  );
};