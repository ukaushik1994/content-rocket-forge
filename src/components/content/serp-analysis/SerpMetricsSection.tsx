
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { SerpAnalysisResult } from '@/services/serpApiService';

export interface SerpMetricsSectionProps {
  serpData: SerpAnalysisResult;
  mainKeyword: string;
  expanded: boolean;
}

export function SerpMetricsSection({ serpData, mainKeyword, expanded }: SerpMetricsSectionProps) {
  if (!expanded) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-md p-4 backdrop-blur-md"
        >
          <div className="text-sm text-muted-foreground mb-1">Search Volume</div>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
              {serpData.searchVolume?.toLocaleString() || 'N/A'}
            </div>
            <TrendingUp className="h-5 w-5 text-purple-400" />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-md p-4 backdrop-blur-md"
        >
          <div className="text-sm text-muted-foreground mb-1">Keyword Difficulty</div>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
              {serpData.keywordDifficulty ? `${serpData.keywordDifficulty}/100` : 'N/A'}
            </div>
            <div className="w-16">
              {serpData.keywordDifficulty && (
                <div className="relative w-full h-2 bg-blue-900/30 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    style={{ width: `${serpData.keywordDifficulty}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-md p-4 backdrop-blur-md"
        >
          <div className="text-sm text-muted-foreground mb-1">Competition</div>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
              {serpData.competitionScore ? `${(serpData.competitionScore * 100).toFixed(0)}%` : 'N/A'}
            </div>
            <div className="w-16">
              {serpData.competitionScore && (
                <div className="relative w-full h-2 bg-green-900/30 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    style={{ width: `${serpData.competitionScore * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
