
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ListChecks } from 'lucide-react';

interface SerpAnalysisHeaderProps {
  mainKeyword: string;
  isAnalyzing: boolean;
  totalSelected: number;
  handleReanalyze: () => void;
  handleContinueWithSelections: () => void;
}

export const SerpAnalysisHeader: React.FC<SerpAnalysisHeaderProps> = ({
  mainKeyword,
  isAnalyzing,
  totalSelected,
  handleReanalyze,
  handleContinueWithSelections
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-medium">SERP Analysis for: {mainKeyword}</h3>
        <p className="text-sm text-muted-foreground">
          Analyze search engine results to optimize your content.
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={handleReanalyze}
          variant="outline"
          disabled={isAnalyzing || !mainKeyword}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Refresh Analysis'
          )}
        </Button>
        
        <Button
          onClick={handleContinueWithSelections}
          disabled={totalSelected === 0 || isAnalyzing}
          className={`gap-2 ${totalSelected > 0 ? 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple' : ''}`}
        >
          <ListChecks className="h-4 w-4" />
          Continue with Selections ({totalSelected})
        </Button>
      </div>
    </div>
  );
};
