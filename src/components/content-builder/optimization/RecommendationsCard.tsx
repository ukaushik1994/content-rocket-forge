
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, Heading2, KeyRound, Wand2, Sparkles } from 'lucide-react';

interface RecommendationsCardProps {
  recommendations: string[];
  recommendationIds: string[];
  isAnalyzing: boolean;
  handleRewriteContent: (recommendation: string, id: string) => void;
  isRecommendationApplied: (id: string) => boolean;
}

export const RecommendationsCard = ({ 
  recommendations, 
  recommendationIds,
  isAnalyzing,
  handleRewriteContent,
  isRecommendationApplied
}: RecommendationsCardProps) => {
  
  // Get appropriate icon based on recommendation
  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation.toLowerCase().includes('keyword')) 
      return <KeyRound className="h-4 w-4 text-purple-500" />;
    if (recommendation.toLowerCase().includes('sentence') || recommendation.toLowerCase().includes('paragraph')) 
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    if (recommendation.toLowerCase().includes('heading')) 
      return <Heading2 className="h-4 w-4 text-green-500" />;
    return <Sparkles className="h-4 w-4 text-blue-500" />;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          <span>Optimization Recommendations</span>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-400/30">
            Click on suggestions to optimize
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <ul className="space-y-3">
            {recommendations.map((recommendation, index) => {
              const isApplied = isRecommendationApplied(recommendationIds[index] || '');
              
              return (
                <li key={index} className={`flex items-start gap-2 group ${isApplied ? 'opacity-70' : ''}`}>
                  <div className="mt-1">
                    {isApplied ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      getRecommendationIcon(recommendation)
                    }
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm ${isApplied ? 'line-through text-muted-foreground' : ''}`}>
                      {recommendation}
                    </span>
                    {isApplied && (
                      <span className="ml-2 text-xs text-green-500">Applied</span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className={`${isApplied ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} transition-opacity gap-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20`}
                    onClick={() => handleRewriteContent(recommendation, recommendationIds[index] || '')}
                    disabled={isApplied}
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Optimize</span>
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>
              {isAnalyzing 
                ? 'Analyzing content...' 
                : 'Run the analysis to get optimization recommendations'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
