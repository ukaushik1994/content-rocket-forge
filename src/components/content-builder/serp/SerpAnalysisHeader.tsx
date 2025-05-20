
import React from 'react';
import { RefreshCcw, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  // Check if we're using mock data or real data
  const isUsingRealData = !!localStorage.getItem('serp_api_key');
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-lg bg-white/5 border border-white/10 backdrop-blur">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold flex items-center">
          SERP Analysis: <span className="ml-2 text-neon-purple">{mainKeyword}</span>
          
          {/* Data source indicator */}
          {isUsingRealData ? (
            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-green-500/20 border border-green-500/30 text-green-400 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" /> Real Data
            </span>
          ) : (
            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> Mock Data
            </span>
          )}
        </h2>
        <p className="text-sm text-white/60">
          Analyze search results and select content to include in your outline
        </p>
      </div>
      
      <div className="flex items-center gap-2 self-end md:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReanalyze}
          disabled={isAnalyzing}
          className="border border-white/10"
        >
          <RefreshCcw className={`h-4 w-4 mr-1 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Again'}
        </Button>
        
        <Button
          size="sm"
          onClick={handleContinueWithSelections}
          disabled={totalSelected === 0}
          className={`${
            totalSelected > 0 
              ? 'bg-gradient-to-r from-neon-purple to-neon-blue' 
              : 'bg-white/10'
          }`}
        >
          Continue With {totalSelected} {totalSelected === 1 ? 'Item' : 'Items'}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
