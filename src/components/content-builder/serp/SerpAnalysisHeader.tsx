
import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, RotateCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-900/30 to-purple-900/20 border border-white/10 backdrop-blur-xl shadow-xl">
      <div className="space-y-1">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <div className="p-2 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center">
            <Search className="h-4 w-4 text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
            SERP Analysis
          </span>
          {mainKeyword && (
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">
              for "{mainKeyword}"
            </span>
          )}
        </h2>
        <p className="text-sm text-muted-foreground">
          Select items to include in your content outline
          {totalSelected > 0 && (
            <Badge variant="outline" className="ml-2 bg-neon-purple/20 border-neon-purple/50">
              {totalSelected} item{totalSelected !== 1 ? 's' : ''} selected
            </Badge>
          )}
        </p>
      </div>
      <div className="flex gap-2 self-end sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReanalyze}
          disabled={isAnalyzing || !mainKeyword}
          className="border-white/20 hover:bg-white/10"
        >
          <RotateCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Reanalyze'}
        </Button>
        
        <Button
          size="sm"
          onClick={handleContinueWithSelections}
          disabled={totalSelected === 0}
          className={`bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300 ${totalSelected === 0 ? 'opacity-50' : ''}`}
        >
          Continue
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
