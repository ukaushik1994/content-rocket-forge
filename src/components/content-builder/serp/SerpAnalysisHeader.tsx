
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, SkipForward } from 'lucide-react';

export interface SerpAnalysisHeaderProps {
  keyword?: string;
  totalSelected?: number;
  onGenerateOutline?: () => void;
  onSkip?: () => void;
}

export const SerpAnalysisHeader: React.FC<SerpAnalysisHeaderProps> = ({
  keyword,
  totalSelected = 0,
  onGenerateOutline,
  onSkip
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-semibold">SERP Analysis</h1>
        {keyword && (
          <p className="text-muted-foreground flex items-center mt-1">
            Analyzing: <span className="font-medium text-foreground ml-2">{keyword}</span>
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {totalSelected > 0 && (
          <Badge variant="outline" className="h-6 px-2">
            {totalSelected} item{totalSelected !== 1 ? 's' : ''} selected
          </Badge>
        )}
        
        <Button
          variant="default"
          size="sm"
          className="gap-1"
          onClick={onGenerateOutline}
          disabled={totalSelected === 0}
        >
          Generate Outline <ArrowRight className="h-4 w-4" />
        </Button>
        
        <Button variant="secondary" size="sm" className="gap-1" onClick={onSkip}>
          Skip <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
