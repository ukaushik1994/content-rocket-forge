
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Wand2, CheckCircle, RefreshCw } from 'lucide-react';
import { useSeoOptimization } from '@/contexts/SeoOptimizationContext';
import { seoAnalysisService } from '@/services/seoAnalysisService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const RecommendationEngine = () => {
  const { state, dispatch } = useSeoOptimization();
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<number>>(new Set());

  if (!state.analysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Analyze content to get AI-powered recommendations</p>
        </CardContent>
      </Card>
    );
  }

  const handleApplyRecommendation = async (recommendation: string, index: number) => {
    setApplyingIndex(index);
    
    try {
      const improvedContent = await seoAnalysisService.applyRecommendation(state.content, recommendation);
      dispatch({ type: 'SET_CONTENT', payload: improvedContent });
      
      // Add to applied recommendations
      const newApplied = new Set(appliedRecommendations);
      newApplied.add(index);
      setAppliedRecommendations(newApplied);
      
      toast.success('Recommendation applied successfully!');
      
      // Re-analyze after applying recommendation
      setTimeout(async () => {
        try {
          const newAnalysis = await seoAnalysisService.analyzeContent(improvedContent);
          dispatch({ type: 'SET_ANALYSIS', payload: newAnalysis });
        } catch (error) {
          console.error('Re-analysis failed:', error);
        }
      }, 1000);
      
    } catch (error) {
      toast.error('Failed to apply recommendation');
    } finally {
      setApplyingIndex(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI-Powered Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {state.analysis.recommendations.map((recommendation, index) => {
            const isApplied = appliedRecommendations.has(index);
            const isApplying = applyingIndex === index;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 border rounded-lg ${isApplied ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm mb-2">{recommendation}</p>
                    {isApplied && (
                      <Badge variant="secondary" className="text-green-700 bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Applied
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={isApplied ? "secondary" : "default"}
                    onClick={() => handleApplyRecommendation(recommendation, index)}
                    disabled={isApplying || isApplied}
                    className="shrink-0"
                  >
                    {isApplying ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Applying...
                      </>
                    ) : isApplied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Applied
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Apply Fix
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
