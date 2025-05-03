
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ListChecks, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 bg-gradient-to-br from-black/20 to-black/40 rounded-xl border border-white/10 backdrop-blur-xl shadow-lg mb-6"
    >
      <div>
        <h3 className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
          SERP Analysis for: <span className="text-primary font-semibold">{mainKeyword}</span>
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Select content elements from search results to optimize your content
        </p>
      </div>
      
      <div className="flex gap-3 w-full md:w-auto">
        <Button
          onClick={handleReanalyze}
          variant="outline"
          disabled={isAnalyzing || !mainKeyword}
          className="border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex-1 md:flex-auto"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Analysis
            </>
          )}
        </Button>
        
        <Button
          onClick={handleContinueWithSelections}
          disabled={totalSelected === 0 || isAnalyzing}
          className={`gap-2 flex-1 md:flex-auto ${totalSelected > 0 ? 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple shadow-lg shadow-primary/20' : 'opacity-70'}`}
        >
          <ListChecks className="h-4 w-4" />
          Continue with {totalSelected} {totalSelected === 1 ? 'Selection' : 'Selections'}
        </Button>
      </div>
    </motion.div>
  );
};
