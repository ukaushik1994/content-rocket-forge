
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ScoreBadgeProps {
  score: number;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  // Determine color based on score
  let bgColor = "bg-red-500/20";
  let textColor = "text-red-500";
  let label = "Poor";
  
  if (score >= 90) {
    bgColor = "bg-green-500/20";
    textColor = "text-green-500";
    label = "Excellent";
  } else if (score >= 70) {
    bgColor = "bg-yellow-500/20";
    textColor = "text-yellow-500";
    label = "Good";
  } else if (score >= 50) {
    bgColor = "bg-orange-500/20";
    textColor = "text-orange-500";
    label = "Average";
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${bgColor} ${textColor} text-xs font-medium`}>
            <span>{score}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">SEO Score: {label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
