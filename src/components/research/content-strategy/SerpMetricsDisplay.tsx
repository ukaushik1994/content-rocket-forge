
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Search, DollarSign, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface SerpMetricsDisplayProps {
  metrics: any;
}

export const SerpMetricsDisplay = ({ metrics }: SerpMetricsDisplayProps) => {
  if (!metrics) return null;

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-400 border-green-400';
    if (difficulty < 60) return 'text-yellow-400 border-yellow-400';
    return 'text-red-400 border-red-400';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 30) return 'Easy';
    if (difficulty < 60) return 'Medium';
    return 'Hard';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10"
    >
      {/* Search Volume */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Search className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-gray-400">Search Volume</span>
        </div>
        <div className="text-2xl font-bold text-blue-400">
          {metrics.searchVolume?.toLocaleString() || 'N/A'}
        </div>
        <div className="text-xs text-gray-500">monthly searches</div>
      </div>

      {/* Keyword Difficulty */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-yellow-400" />
          <span className="text-sm text-gray-400">Difficulty</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="text-2xl font-bold text-yellow-400">
            {metrics.keywordDifficulty || 'N/A'}
          </div>
          {metrics.keywordDifficulty && (
            <Badge 
              variant="outline" 
              className={`text-xs ${getDifficultyColor(metrics.keywordDifficulty)}`}
            >
              {getDifficultyLabel(metrics.keywordDifficulty)}
            </Badge>
          )}
        </div>
      </div>

      {/* CPC */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-green-400" />
          <span className="text-sm text-gray-400">CPC</span>
        </div>
        <div className="text-2xl font-bold text-green-400">
          ${metrics.cpc?.toFixed(2) || '0.00'}
        </div>
        <div className="text-xs text-gray-500">per click</div>
      </div>

      {/* Competition Score */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-purple-400" />
          <span className="text-sm text-gray-400">Competition</span>
        </div>
        <div className="text-2xl font-bold text-purple-400">
          {metrics.competitionScore ? (metrics.competitionScore * 100).toFixed(0) : 'N/A'}%
        </div>
        <div className="text-xs text-gray-500">advertiser competition</div>
      </div>

      {/* Top Results Preview */}
      {metrics.topResults && metrics.topResults.length > 0 && (
        <div className="col-span-full mt-4">
          <h4 className="text-sm font-medium text-white mb-3">Top Search Results</h4>
          <div className="space-y-2">
            {metrics.topResults.slice(0, 3).map((result: any, index: number) => (
              <div key={index} className="p-2 bg-white/5 rounded border border-white/10">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs shrink-0">
                    #{result.position}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white truncate">
                      {result.title}
                    </div>
                    <div className="text-xs text-blue-400 truncate">
                      {result.url}
                    </div>
                    {result.snippet && (
                      <div className="text-xs text-gray-400 line-clamp-2 mt-1">
                        {result.snippet}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
