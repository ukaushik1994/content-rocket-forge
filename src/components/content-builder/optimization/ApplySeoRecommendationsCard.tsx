
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, Wand2 } from 'lucide-react';
import { useSeoRecommendations } from '@/hooks/seo-analysis/useSeoRecommendations';
import { motion } from 'framer-motion';

export const ApplySeoRecommendationsCard = () => {
  const { 
    prioritizedRecommendations, 
    applyAllRecommendations, 
    isRecommendationApplied,
    unappliedRecommendationsCount
  } = useSeoRecommendations();

  // No recommendations to show
  if (prioritizedRecommendations.length === 0) {
    return null;
  }

  // All recommendations already applied
  if (unappliedRecommendationsCount === 0) {
    return (
      <Card className="bg-green-50/50 border-green-100 shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-green-700">
            <Check className="h-4 w-4" />
            All Recommendations Applied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">
            You've applied all the SEO recommendations. Your content is optimized!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group recommendations by impact
  const highImpact = prioritizedRecommendations.filter(rec => rec.impact === 'high' && !rec.applied);
  const mediumImpact = prioritizedRecommendations.filter(rec => rec.impact === 'medium' && !rec.applied);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-indigo-100 bg-indigo-50/30 shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-indigo-500" />
              <span>Auto-Apply Recommendations</span>
            </span>
            <Badge variant="outline" className="bg-indigo-100/50 text-indigo-700 border-indigo-200">
              {unappliedRecommendationsCount} pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use these recommendations when generating new content to improve SEO:
            </p>
            
            {highImpact.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                  <p className="text-xs font-medium text-orange-700">High Impact ({highImpact.length})</p>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {highImpact.slice(0, 2).map((rec, i) => (
                    <li key={i} className="ml-5 list-disc">
                      {rec.recommendation}
                    </li>
                  ))}
                  {highImpact.length > 2 && (
                    <li className="ml-5 text-xs text-muted-foreground">
                      +{highImpact.length - 2} more high-impact recommendations
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            {mediumImpact.length > 0 && mediumImpact.length <= 3 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Medium Impact ({mediumImpact.length})
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {mediumImpact.slice(0, 1).map((rec, i) => (
                    <li key={i} className="ml-5 list-disc">
                      {rec.recommendation}
                    </li>
                  ))}
                  {mediumImpact.length > 1 && (
                    <li className="ml-5 text-xs text-muted-foreground">
                      +{mediumImpact.length - 1} more medium-impact recommendations
                    </li>
                  )}
                </ul>
              </div>
            )}

            <Button 
              onClick={applyAllRecommendations}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Apply All Recommendations
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              These recommendations will be included in the next content generation.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
