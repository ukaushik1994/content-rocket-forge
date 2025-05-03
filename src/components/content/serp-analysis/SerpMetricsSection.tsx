
import React from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp } from 'lucide-react';
import { SerpMetricsCard } from './SerpMetricsCard';
import { SerpAnalysisResult } from '@/services/serpApiService';

interface SerpMetricsSectionProps {
  serpData: SerpAnalysisResult;
  mainKeyword: string;
  expanded: boolean;
}

export function SerpMetricsSection({
  serpData,
  mainKeyword,
  expanded
}: SerpMetricsSectionProps) {
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
        <SerpMetricsCard 
          title="Search Volume" 
          value={serpData.searchVolume?.toLocaleString() || 'N/A'} 
          icon={<TrendingUp className="h-5 w-5 text-purple-400" />}
          gradient="from-purple-400 to-purple-600"
        />
        
        <SerpMetricsCard 
          title="Keyword Difficulty" 
          value={serpData.keywordDifficulty ? `${serpData.keywordDifficulty}/100` : 'N/A'} 
          icon={<Search className="h-5 w-5 text-blue-400" />}
          gradient="from-blue-400 to-blue-600"
          progressValue={serpData.keywordDifficulty}
        />
        
        <SerpMetricsCard 
          title="Competition" 
          value={serpData.competitionScore ? `${(serpData.competitionScore * 100).toFixed(0)}%` : 'N/A'} 
          icon={<TrendingUp className="h-5 w-5 text-green-400" />}
          gradient="from-green-400 to-green-600"
          progressValue={serpData.competitionScore ? serpData.competitionScore * 100 : undefined}
        />
      </div>
    </motion.div>
  );
}
