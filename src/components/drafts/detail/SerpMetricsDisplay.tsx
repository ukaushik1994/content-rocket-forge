
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart2, TrendingUp, Target, Search } from 'lucide-react';
import { SerpMetrics, RankingOpportunities } from '@/types/serp-metrics';

interface SerpMetricsDisplayProps {
  serpMetrics: SerpMetrics;
  rankingOpportunities: RankingOpportunities;
}

export const SerpMetricsDisplay = ({ serpMetrics, rankingOpportunities }: SerpMetricsDisplayProps) => {
  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return 'bg-gray-500';
    if (difficulty < 30) return 'bg-green-500';
    if (difficulty < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getIntentColor = (intent?: string) => {
    switch (intent) {
      case 'commercial': return 'bg-purple-500/20 text-purple-300';
      case 'transactional': return 'bg-green-500/20 text-green-300';
      case 'informational': return 'bg-blue-500/20 text-blue-300';
      case 'navigational': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          SEO Metrics Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Keyword Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 p-3 rounded">
            <div className="text-sm text-muted-foreground">Search Volume</div>
            <div className="text-lg font-semibold">{serpMetrics.searchVolume?.toLocaleString() || 'N/A'}</div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded">
            <div className="text-sm text-muted-foreground">Keyword Difficulty</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">{serpMetrics.keywordDifficulty || 'N/A'}</div>
              {serpMetrics.keywordDifficulty && (
                <Progress 
                  value={serpMetrics.keywordDifficulty} 
                  className="w-12 h-2"
                  style={{ '--progress-background': getDifficultyColor(serpMetrics.keywordDifficulty) } as any}
                />
              )}
            </div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded">
            <div className="text-sm text-muted-foreground">Competition</div>
            <div className="text-lg font-semibold">{serpMetrics.competitionScore || 'N/A'}</div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded">
            <div className="text-sm text-muted-foreground">Intent</div>
            <Badge className={getIntentColor(serpMetrics.intent)}>
              {serpMetrics.intent || 'Unknown'}
            </Badge>
          </div>
        </div>

        {/* Ranking Opportunities */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Ranking Opportunities
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Featured Snippet</span>
              <Badge variant={rankingOpportunities.featuredSnippetChance === 'high' ? 'default' : 'secondary'}>
                {rankingOpportunities.featuredSnippetChance}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">PAA Questions</span>
              <span className="text-sm font-medium">{rankingOpportunities.paaOpportunities}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Image Opportunity</span>
              <Badge variant={rankingOpportunities.imageOpportunities ? 'default' : 'secondary'}>
                {rankingOpportunities.imageOpportunities ? 'Yes' : 'No'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Video Opportunity</span>
              <Badge variant={rankingOpportunities.videoOpportunities ? 'default' : 'secondary'}>
                {rankingOpportunities.videoOpportunities ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content Recommendations */}
        <div>
          <h4 className="font-medium mb-2">Content Recommendations</h4>
          <div className="text-sm text-muted-foreground">
            Recommended Length: <span className="font-medium">{rankingOpportunities.recommendedContentLength} words</span>
          </div>
          {rankingOpportunities.missingTopics.length > 0 && (
            <div className="mt-2">
              <div className="text-sm text-muted-foreground mb-1">Missing Topics:</div>
              <div className="flex flex-wrap gap-1">
                {rankingOpportunities.missingTopics.slice(0, 5).map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
