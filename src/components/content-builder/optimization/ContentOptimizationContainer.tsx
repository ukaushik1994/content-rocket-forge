
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SeoScoreCard } from './SeoScoreCard';
import { RecommendationsCard } from './RecommendationsCard'; 
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ContentOptimizationContainerProps {
  recommendations: string[];
  recommendationIds: string[];
  scores: { keywordUsage: number; contentLength: number; readability: number };
  seoScore: number;
  isAnalyzing: boolean;
  handleRewriteContent: (recommendation: string, id: string) => void;
  isRecommendationApplied: (id: string) => boolean;
  getScoreColor: (score: number) => string;
  hasRunAnalysis: boolean;
  handleSkipConfirm: () => void;
}

export const ContentOptimizationContainer = ({
  recommendations,
  recommendationIds,
  scores,
  seoScore,
  isAnalyzing,
  handleRewriteContent,
  isRecommendationApplied,
  getScoreColor,
  hasRunAnalysis,
  handleSkipConfirm
}: ContentOptimizationContainerProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <RecommendationsCard 
            recommendations={recommendations} 
            recommendationIds={recommendationIds}
            isAnalyzing={isAnalyzing}
            handleRewriteContent={handleRewriteContent}
            isRecommendationApplied={isRecommendationApplied}
          />
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SeoScoreCard 
          seoScore={seoScore} 
          scores={scores} 
          getScoreColor={getScoreColor}
        />
        
        {/* Skip button card */}
        {!hasRunAnalysis && (
          <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Don't want to optimize your content now?
              </p>
              <Button 
                onClick={handleSkipConfirm} 
                variant="outline" 
                className="w-full border-gray-300"
              >
                Skip Optimization <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
