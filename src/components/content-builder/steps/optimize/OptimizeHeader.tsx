
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, BarChart2, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface OptimizeHeaderProps {
  seoScore: number;
  isAnalyzing: boolean;
  optimizationSkipped: boolean;
  onAnalyze: () => void;
  onSkip: () => void;
}

export const OptimizeHeader: React.FC<OptimizeHeaderProps> = ({
  seoScore,
  isAnalyzing,
  optimizationSkipped,
  onAnalyze,
  onSkip
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-purple-900/20 via-blue-900/10 to-blue-900/5 border border-purple-500/20 rounded-xl p-6 shadow-xl"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              SEO Content Optimization
            </span>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isAnalyzing 
              ? "Analyzing your content..."
              : "Analyze your content and apply AI-powered optimizations to increase your SEO score."}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {seoScore > 0 && (
            <Badge variant="outline" className="bg-card px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
              <BarChart2 className="h-3.5 w-3.5 text-purple-500" />
              <span>Score: </span>
              <span className={`font-bold ${seoScore >= 70 ? 'text-green-500' : seoScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                {seoScore}
              </span>
            </Badge>
          )}
          
          {/* Skip button or Continue button depending on status */}
          {!optimizationSkipped && seoScore < 70 && (
            <Button
              onClick={onSkip}
              variant="outline"
              size="sm"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Skip Optimization
            </Button>
          )}
          
          <Button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className={seoScore > 0 ? 'gap-2' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2 shadow-md shadow-purple-500/20'}
            size="sm"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                {seoScore > 0 ? 'Re-analyze' : 'Analyze Content'}
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
