
import React from 'react';
import { motion } from 'framer-motion';
import { SerpAnalysisResult } from '@/types/serp';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export interface SerpOverviewSectionProps {
  serpData: SerpAnalysisResult;
  mainKeyword: string;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpOverviewSection({ 
  serpData, 
  mainKeyword, 
  expanded,
  onAddToContent = () => {}
}: SerpOverviewSectionProps) {
  if (!expanded) return null;
  
  const recommendations = serpData.recommendations || [];
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <Card className="border border-purple-500/20 shadow-lg bg-gradient-to-br from-purple-900/20 via-black/20 to-black/30 backdrop-blur-md overflow-hidden">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 group"
              >
                <div className="min-w-5 h-5 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center text-white text-xs">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{recommendation}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2 hover:bg-purple-500/20"
                  onClick={() => onAddToContent(recommendation, 'recommendation')}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <span className="text-xs">Add</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          variant="outline"
          size="sm"
          className="text-xs border-purple-500/30 hover:bg-purple-500/20"
          onClick={() => {
            const allRecommendations = recommendations.join('\n\n');
            onAddToContent(allRecommendations, 'allRecommendations');
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add all recommendations
        </Button>
      </div>
    </motion.div>
  );
}
