
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ChevronRight, Search, Database } from 'lucide-react';
import { SerpProviderSelector } from './SerpProviderSelector';
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';

interface SerpAnalysisHeaderProps {
  mainKeyword: string;
  isAnalyzing: boolean;
  totalSelected: number;
  handleReanalyze: () => void;
  handleContinueWithSelections: () => void;
  currentProvider?: SerpProvider;
  onProviderChange?: (provider: SerpProvider) => void;
}

export const SerpAnalysisHeader = ({
  mainKeyword,
  isAnalyzing,
  totalSelected,
  handleReanalyze,
  handleContinueWithSelections,
  currentProvider,
  onProviderChange
}: SerpAnalysisHeaderProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Search Data Analysis</h2>
          <p className="text-muted-foreground text-sm">
            Analyze search data for keyword:{" "}
            <span className="text-primary font-medium">{mainKeyword || "No keyword selected"}</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <SerpProviderSelector onProviderChange={onProviderChange} />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReanalyze} 
            disabled={isAnalyzing || !mainKeyword}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? "Analyzing..." : "Refresh Data"}
          </Button>
          
          <Button 
            onClick={handleContinueWithSelections} 
            size="sm" 
            disabled={isAnalyzing || totalSelected === 0}
          >
            Continue
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="flex items-center text-sm text-muted-foreground">
          <Search className="h-4 w-4 mr-1" />
          <span>Analysis results</span>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="bg-white/10">
            <Database className="h-3 w-3 mr-1" />
            {currentProvider || 'Default Provider'}
          </Badge>
          
          {totalSelected > 0 && (
            <Badge className="bg-blue-500/80 hover:bg-blue-500">
              {totalSelected} item{totalSelected !== 1 ? "s" : ""} selected
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
