import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';

interface ContentRecommendationsCardProps {
  serpData: SerpAnalysisResult;
}

export const ContentRecommendationsCard: React.FC<ContentRecommendationsCardProps> = ({ serpData }) => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div variants={item} className="h-full">
      <Card className="overflow-hidden bg-gradient-to-br from-purple-900/10 to-blue-900/10 border border-white/10 backdrop-blur-lg h-full shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-2 bg-gradient-to-r from-purple-900/20 to-purple-900/5 border-b border-white/10">
          <CardTitle className="text-md flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-200">
              Content Recommendations
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {serpData.recommendations && serpData.recommendations.length > 0 ? (
            <motion.ul 
              variants={container}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              {serpData.recommendations.map((recommendation, index) => (
                <motion.li 
                  key={index} 
                  variants={item}
                  className="text-sm flex items-start gap-2"
                >
                  <div className="min-w-5 h-5 rounded-full bg-gradient-to-r from-purple-600/30 to-blue-600/30 flex items-center justify-center text-xs mt-0.5">
                    {index + 1}
                  </div>
                  <span>{recommendation}</span>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <p className="text-sm text-muted-foreground">No recommendations available.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
