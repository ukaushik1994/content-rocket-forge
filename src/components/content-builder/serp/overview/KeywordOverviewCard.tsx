import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';

interface KeywordOverviewCardProps {
  serpData: SerpAnalysisResult;
}

export const KeywordOverviewCard: React.FC<KeywordOverviewCardProps> = ({ serpData }) => {
  const item = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div variants={item} className="h-full">
      <Card className="overflow-hidden bg-gradient-to-br from-blue-900/10 to-purple-900/10 border border-white/10 backdrop-blur-lg h-full shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-900/20 to-blue-900/5 border-b border-white/10">
          <CardTitle className="text-md flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
              Keyword Overview
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <motion.div 
            variants={container}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <motion.div variants={item} className="flex justify-between items-center group">
              <span className="text-sm text-muted-foreground">Search Volume:</span>
              <span className="font-medium text-blue-300">{serpData.searchVolume ? serpData.searchVolume.toLocaleString() : 'N/A'}</span>
            </motion.div>
            <motion.div variants={item} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Difficulty:</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    style={{ width: `${serpData.keywordDifficulty || 0}%` }}
                  />
                </div>
                <span className="font-medium text-blue-300">{serpData.keywordDifficulty || 'N/A'}</span>
              </div>
            </motion.div>
            <motion.div variants={item} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Competition:</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    style={{ width: `${(serpData.competitionScore || 0) * 100}%` }}
                  />
                </div>
                <span className="font-medium text-blue-300">
                  {serpData.competitionScore ? `${(serpData.competitionScore * 100).toFixed(0)}%` : 'N/A'}
                </span>
              </div>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
