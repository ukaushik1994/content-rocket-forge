
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContentCardKeywordsProps {
  keywords?: string[];
}

export const ContentCardKeywords: React.FC<ContentCardKeywordsProps> = ({ keywords }) => {
  if (!keywords || keywords.length === 0) return null;
  
  // Normalize keywords - handle both string[] and object[] formats
  const normalizedKeywords = keywords.map(k => 
    typeof k === 'string' ? k : (k as any).keyword || String(k)
  );
  
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {normalizedKeywords.slice(0, 3).map((keyword, i) => (
        <TooltipProvider key={i}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="inline-flex text-[10px] px-1.5 py-0.5 bg-secondary/30 rounded hover:bg-secondary/40 transition-colors cursor-help"
              >
                {keyword}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Used as SEO keyword</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {normalizedKeywords.length > 3 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex text-[10px] px-1.5 py-0.5 bg-secondary/10 rounded cursor-help">
                +{normalizedKeywords.length - 3}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{normalizedKeywords.slice(3).join(', ')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
