import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Gem } from 'lucide-react';

interface ValueScoreBadgeProps {
  score: number;
}

export const ValueScoreBadge: React.FC<ValueScoreBadgeProps> = ({ score }) => {
  if (!score || score <= 0) return null;
  
  const color = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-muted-foreground';
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${color}`}>
          <Gem className="h-3 w-3" />
          {Math.round(score)}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">Content Value Score: {Math.round(score)}/100</p>
        <p className="text-[10px] text-muted-foreground">Based on SEO, repurpose count, and freshness</p>
      </TooltipContent>
    </Tooltip>
  );
};