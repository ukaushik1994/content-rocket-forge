
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface KeywordPerformanceCardProps {
  keywords: string[];
  keywordUsage: any[];
  isAnalyzing: boolean;
  onRetryAnalysis: () => void;
}

export const KeywordPerformanceCard = ({
  keywords,
  keywordUsage,
  isAnalyzing,
  onRetryAnalysis
}: KeywordPerformanceCardProps) => {
  
  const getKeywordScore = (usage: any) => {
    if (!usage || usage.count === 0) return 0;
    
    // Parse density percentage
    const density = parseFloat(usage.density.replace('%', ''));
    
    // Optimal density is between 1-3%
    if (density < 0.5) return 25; // Too low
    if (density < 1) return 60; // Below optimal
    if (density <= 3) return 100; // Optimal
    if (density <= 5) return 75; // Above optimal but acceptable
    return 40; // Too high
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (isAnalyzing) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Keyword Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Analyzing keywords...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!keywords || keywords.length === 0) {
    return (
      <Card className="h-full border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Keyword Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium text-yellow-700 dark:text-yellow-300 mb-2">
            No Keywords Defined
          </h3>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
            This draft doesn't have any keywords assigned for analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (keywordUsage.length === 0) {
    return (
      <Card className="h-full border-red-200 bg-red-50/50 dark:bg-red-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Keyword Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-700 dark:text-red-300 mb-2">
            Analysis Failed
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 text-center mb-4">
            Unable to analyze keyword usage. This might be due to missing content.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetryAnalysis}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall keyword performance
  const totalScore = keywordUsage.reduce((sum, usage) => sum + getKeywordScore(usage), 0);
  const averageScore = Math.round(totalScore / keywordUsage.length);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5" />
          Keyword Performance
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-2xl font-bold text-primary">{averageScore}%</span>
            <Badge variant="outline" className="text-xs">
              {getScoreLabel(averageScore)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetryAnalysis}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {keywordUsage.map((usage, index) => {
          const score = getKeywordScore(usage);
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm truncate flex-1 mr-2">
                  {usage.keyword}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {usage.density}
                  </Badge>
                  <span className={`text-xs font-medium ${getScoreColor(score)}`}>
                    {score}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={score} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground">
                  {usage.count}×
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {score >= 80 ? 'Optimal keyword density' :
                 score >= 60 ? 'Good keyword usage' :
                 score >= 40 ? 'Could use more mentions' :
                 'Keyword underutilized'}
              </div>
            </div>
          );
        })}
        
        {keywords.length > keywordUsage.length && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              {keywords.length - keywordUsage.length} keyword(s) not found in content
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
