import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, RotateCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface SerpAnalysisHeaderProps {
  mainKeyword: string;
  isAnalyzing: boolean;
  hasSelections: boolean;
  onAnalyze: () => Promise<void>;
  onNextStep: () => void;
  showAllData: boolean;
  onToggleAllData: () => void;
  totalSelected?: number;
  handleReanalyze?: () => void;
  handleContinueWithSelections?: () => void;
}

export const SerpAnalysisHeader: React.FC<SerpAnalysisHeaderProps> = ({
  mainKeyword,
  isAnalyzing,
  totalSelected = 0,
  handleReanalyze,
  handleContinueWithSelections,
  onAnalyze,
  hasSelections,
  onNextStep,
  showAllData,
  onToggleAllData
}) => {
  // Use either keyword or mainKeyword - maintain backward compatibility
  const displayKeyword = keyword || mainKeyword;
  
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
          {displayKeyword && (
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">
              for "{displayKeyword}"
            </span>
          )}
        </h2>
        <p className="text-sm text-muted-foreground">
          Select items to include in your content outline
          {(totalSelected > 0 || hasSelections) && (
            <Badge variant="outline" className="ml-2 bg-neon-purple/20 border-neon-purple/50">
              {totalSelected || (hasSelections ? "Items" : "0")} selected
            </Badge>
          )}
        </p>
      </div>
      <div className="flex gap-2 self-end sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReanalyze || onAnalyze}
          disabled={isAnalyzing || !displayKeyword}
          className="border-white/20 hover:bg-white/10"
        >
          <RotateCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Reanalyze'}
        </Button>
        
        <Button
          size="sm"
          onClick={handleContinueWithSelections || onNextStep}
          disabled={!hasSelections && totalSelected === 0}
          className={`bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300 ${(!hasSelections && totalSelected === 0) ? 'opacity-50' : ''}`}
        >
          Continue
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
