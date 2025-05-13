
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, ChevronRight, CheckCircle, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export interface SerpAnalysisHeaderProps {
  mainKeyword: string;
  isAnalyzing: boolean;
  hasSelections: boolean;
  onAnalyze: () => void;
  onNextStep: () => void;
  showAllData: boolean;
  onToggleAllData: () => void;
  totalSelected: number;
}

export const SerpAnalysisHeader: React.FC<SerpAnalysisHeaderProps> = ({
  mainKeyword,
  isAnalyzing,
  hasSelections,
  onAnalyze,
  onNextStep,
  showAllData,
  onToggleAllData,
  totalSelected
}) => {
  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Search className="h-5 w-5 mr-2 text-primary" />
            SERP Analysis: {mainKeyword}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onAnalyze}
                disabled={isAnalyzing}
                size="sm"
                className="bg-white/10 text-primary border-primary/40"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
              </Button>
              <Button 
                variant="outline" 
                onClick={onToggleAllData}
                size="sm"
                className="bg-white/10 border-white/30"
              >
                <ArrowUpRight className="h-4 w-4 mr-1" />
                {showAllData ? 'Show Less' : 'Show All Data'}
              </Button>
            </div>
            
            <Button 
              onClick={onNextStep}
              disabled={!hasSelections}
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
            >
              {totalSelected > 0 && (
                <span className="mr-1 bg-white/20 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalSelected}
                </span>
              )}
              <span>Generate Outline</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          {/* Selection guidance */}
          {!hasSelections && (
            <div className="mt-3 text-xs text-amber-400 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Select questions, keywords, and snippets to generate your outline
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
