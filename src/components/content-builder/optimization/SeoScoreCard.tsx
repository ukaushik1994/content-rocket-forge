
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress'; 
import { AlertCircle, CheckCircle, BookOpen, ListChecks, KeyRound, Type } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScoreProps {
  keywordScore: number;
  readabilityScore: number;
  contentLengthScore: number;
  structureScore: number;
}

interface SeoScoreCardProps {
  seoScore: number;
  scores: ScoreProps;
  getScoreColor: (score: number) => string;
}

export const SeoScoreCard = ({ seoScore, scores, getScoreColor }: SeoScoreCardProps) => {
  // Helper to get score rating text
  const getScoreRating = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Average';
    return 'Needs Improvement';
  };
  
  // Helper for score icon
  const getScoreIcon = (score: number) => {
    if (score >= 70) return <CheckCircle className={`h-4 w-4 text-${getScoreColor(score)}-500`} />;
    return <AlertCircle className={`h-4 w-4 text-${getScoreColor(score)}-500`} />;
  };
  
  // Calculate the overall SEO rating
  const seoRating = getScoreRating(seoScore);
  const seoScoreColor = getScoreColor(seoScore);
  
  return (
    <Card className="shadow-xl bg-gradient-to-br from-background to-purple-950/5 border border-purple-500/20 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          SEO Score Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Overall SEO Score */}
        <div className="flex justify-between items-end mb-1">
          <span className="text-sm font-medium">Overall SEO Score</span>
          <span className="text-sm font-bold">{seoScore}%</span>
        </div>
        <div className="relative h-4 mb-4 rounded-full overflow-hidden">
          <Progress 
            value={seoScore} 
            className={`h-4 bg-${seoScoreColor}-100`} 
            indicatorClassName={`bg-${seoScoreColor}-500`} 
          />
          
          {/* Animated dots */}
          {seoScore >= 50 && (
            <motion.div 
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div 
                className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white opacity-75`}
                animate={{ 
                  x: ['0%', '100%', '0%'],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          )}
        </div>
        
        <p className={`text-sm text-${seoScoreColor}-600 font-medium mb-4 text-center`}>
          {seoRating}
        </p>
        
        {seoScore > 0 && (
          <motion.div 
            className="space-y-3 mt-4"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-xs mb-2 text-gray-500 font-medium">Detailed Scores</h4>
            
            {/* Keyword Score */}
            <div className="flex items-center gap-2.5 text-xs">
              <KeyRound className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">Keywords</span>
                  <span className={`text-${getScoreColor(scores.keywordScore)}-600`}>
                    {scores.keywordScore}%
                  </span>
                </div>
                <Progress 
                  value={scores.keywordScore} 
                  className="h-1 mt-1 bg-blue-100" 
                  indicatorClassName="bg-blue-500" 
                />
              </div>
            </div>
            
            {/* Readability Score */}
            <div className="flex items-center gap-2.5 text-xs">
              <BookOpen className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">Readability</span>
                  <span className={`text-${getScoreColor(scores.readabilityScore)}-600`}>
                    {scores.readabilityScore}%
                  </span>
                </div>
                <Progress 
                  value={scores.readabilityScore} 
                  className="h-1 mt-1 bg-green-100" 
                  indicatorClassName="bg-green-500" 
                />
              </div>
            </div>
            
            {/* Content Length Score */}
            <div className="flex items-center gap-2.5 text-xs">
              <Type className="h-4 w-4 text-amber-500" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">Content Length</span>
                  <span className={`text-${getScoreColor(scores.contentLengthScore)}-600`}>
                    {scores.contentLengthScore}%
                  </span>
                </div>
                <Progress 
                  value={scores.contentLengthScore} 
                  className="h-1 mt-1 bg-amber-100" 
                  indicatorClassName="bg-amber-500" 
                />
              </div>
            </div>
            
            {/* Structure Score */}
            <div className="flex items-center gap-2.5 text-xs">
              <ListChecks className="h-4 w-4 text-purple-500" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">Structure</span>
                  <span className={`text-${getScoreColor(scores.structureScore)}-600`}>
                    {scores.structureScore}%
                  </span>
                </div>
                <Progress 
                  value={scores.structureScore} 
                  className="h-1 mt-1 bg-purple-100" 
                  indicatorClassName="bg-purple-500" 
                />
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
