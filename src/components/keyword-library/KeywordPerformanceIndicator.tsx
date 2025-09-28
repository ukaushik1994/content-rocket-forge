import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Target, Zap } from 'lucide-react';
import { UnifiedKeyword } from '@/services/keywordLibraryService';

interface KeywordPerformanceIndicatorProps {
  keyword: UnifiedKeyword;
  showDetails?: boolean;
}

export const KeywordPerformanceIndicator: React.FC<KeywordPerformanceIndicatorProps> = ({
  keyword,
  showDetails = false
}) => {
  // Calculate performance score (0-100)
  const calculatePerformanceScore = (): number => {
    if (!keyword.search_volume || !keyword.difficulty) return 0;
    
    // Normalize search volume (log scale)
    const volumeScore = Math.min(100, Math.log10(keyword.search_volume + 1) * 20);
    
    // Invert difficulty (lower difficulty = higher score)
    const difficultyScore = Math.max(0, 100 - keyword.difficulty);
    
    // Weight: 60% difficulty, 40% volume
    return Math.round((difficultyScore * 0.6) + (volumeScore * 0.4));
  };

  // Calculate opportunity score (volume/difficulty ratio)
  const calculateOpportunityScore = (): number => {
    if (!keyword.search_volume || !keyword.difficulty || keyword.difficulty === 0) return 0;
    
    const ratio = keyword.search_volume / keyword.difficulty;
    // Normalize to 0-100 scale
    return Math.min(100, Math.log10(ratio + 1) * 25);
  };

  const performanceScore = calculatePerformanceScore();
  const opportunityScore = calculateOpportunityScore();

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-info';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'destructive';
  };

  const getTrendIcon = () => {
    const trend = keyword.trend_direction;
    if (trend === 'up') return <TrendingUp className="h-3 w-3 text-success" />;
    if (trend === 'down') return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getDataFreshnessColor = (): string => {
    if (!keyword.serp_last_updated) return 'text-muted-foreground';
    
    const lastUpdated = new Date(keyword.serp_last_updated);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return lastUpdated > oneDayAgo ? 'text-success' : 'text-warning';
  };

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2">
        {performanceScore > 0 && (
          <Badge variant={getScoreBadgeVariant(performanceScore)} className="text-xs">
            <Target className="h-3 w-3 mr-1" />
            {performanceScore}
          </Badge>
        )}
        {opportunityScore > 0 && (
          <Badge variant="outline" className="text-xs border-info/30 text-info">
            <Zap className="h-3 w-3 mr-1" />
            {opportunityScore}
          </Badge>
        )}
        {getTrendIcon()}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Performance Score */}
      {performanceScore > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-medium">Performance</span>
            </div>
            <span className={`font-medium ${getScoreColor(performanceScore)}`}>
              {performanceScore}/100
            </span>
          </div>
          <Progress 
            value={performanceScore} 
            className="h-2"
          />
        </div>
      )}

      {/* Opportunity Score */}
      {opportunityScore > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-info" />
              <span className="font-medium">Opportunity</span>
            </div>
            <span className={`font-medium ${getScoreColor(opportunityScore)}`}>
              {opportunityScore}/100
            </span>
          </div>
          <Progress 
            value={opportunityScore} 
            className="h-2"
          />
        </div>
      )}

      {/* Data Quality Indicators */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span>Trend: {keyword.trend_direction || 'stable'}</span>
        </div>
        
        <div className={`flex items-center gap-1 ${getDataFreshnessColor()}`}>
          <div className={`w-2 h-2 rounded-full ${getDataFreshnessColor().replace('text-', 'bg-')}`} />
          <span>
            {keyword.serp_last_updated 
              ? new Date(keyword.serp_last_updated).toLocaleDateString()
              : 'No data'
            }
          </span>
        </div>
      </div>
    </div>
  );
};