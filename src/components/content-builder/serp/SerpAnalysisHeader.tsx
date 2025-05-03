
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ListChecks, RefreshCw, Search } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative p-6 bg-gradient-to-br from-black/40 to-black/60 rounded-xl border border-white/10 backdrop-blur-xl shadow-lg mb-6 overflow-hidden"
    >
      {/* Background abstract shapes */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-0 left-0 w-40 h-40 bg-blue-600 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-600 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <motion.div 
              className="p-2 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 backdrop-blur-md border border-white/10 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, 0] }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Search className="text-white h-5 w-5" />
            </motion.div>
            
            <motion.h3 
              className="font-semibold text-xl"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Analysis for: <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">"{mainKeyword}"</span>
            </motion.h3>
            
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center bg-blue-900/20 py-0.5 px-2 rounded-full border border-blue-500/30"
              >
                <span className="text-xs text-blue-300 flex items-center gap-1">
                  <span className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></span>
                  Analyzing
                </span>
              </motion.div>
            )}
          </div>
          
          <motion.p 
            className="text-sm text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Select content elements from search results to optimize your content
          </motion.p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              onClick={handleReanalyze}
              variant="outline"
              disabled={isAnalyzing || !mainKeyword}
              className="border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex-1 md:flex-auto group"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-400" />
                  <span className="text-blue-300">Analyzing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  Refresh Analysis
                </>
              )}
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              onClick={handleContinueWithSelections}
              disabled={totalSelected === 0 || isAnalyzing}
              className={`gap-2 flex-1 md:flex-auto relative overflow-hidden ${totalSelected > 0 ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg' : 'opacity-70'}`}
            >
              {/* Animated background for the active button */}
              {totalSelected > 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
              )}
              
              <ListChecks className="h-4 w-4 relative z-10" />
              <span className="relative z-10">
                Continue with <Badge variant="outline" className="ml-0.5 mr-0.5 bg-white/20 border-0 text-white">{totalSelected}</Badge> {totalSelected === 1 ? 'Selection' : 'Selections'}
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
