
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ContentItemType } from '@/contexts/content/types';
import { analyzeContentForReview, generateApprovalRecommendation, AIReviewAnalysis } from '@/services/aiReviewService';
import { Brain, AlertTriangle, CheckCircle2, XCircle, TrendingUp, Loader2, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIReviewAssistantProps {
  content: ContentItemType;
  onRecommendationGenerated?: (recommendation: any) => void;
  className?: string;
}

export const AIReviewAssistant: React.FC<AIReviewAssistantProps> = ({
  content,
  onRecommendationGenerated,
  className
}) => {
  const [analysis, setAnalysis] = useState<AIReviewAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  // Auto-analyze when component mounts or content changes
  useEffect(() => {
    if (content && content.content) {
      analyzeContent();
    }
  }, [content.id]);

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeContentForReview(content);
      if (result) {
        setAnalysis(result);
        const rec = generateApprovalRecommendation(result);
        setRecommendation(rec);
        onRecommendationGenerated?.(rec);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'approve': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'request_changes': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'reject': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Brain className="h-5 w-5 text-blue-600" />;
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'major': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'minor': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isAnalyzing) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <h3 className="text-lg font-medium">AI Analyzing Content...</h3>
            <p className="text-sm text-muted-foreground">
              Checking quality, SEO, brand compliance, and readability
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Review Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Click to analyze this content with AI</p>
            <Button onClick={analyzeContent} disabled={!content.content}>
              <Brain className="h-4 w-4 mr-2" />
              Analyze Content
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Review Assistant
          </div>
          <Button variant="outline" size="sm" onClick={analyzeContent}>
            Re-analyze
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Score</span>
            <span className={cn("text-2xl font-bold", getScoreColor(analysis.overallScore))}>
              {analysis.overallScore}%
            </span>
          </div>
          <Progress value={analysis.overallScore} className="h-2" />
        </div>

        {/* Detailed Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Quality</span>
              <span className={getScoreColor(analysis.qualityScore)}>{analysis.qualityScore}%</span>
            </div>
            <Progress value={analysis.qualityScore} className="h-1" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>SEO</span>
              <span className={getScoreColor(analysis.seoScore)}>{analysis.seoScore}%</span>
            </div>
            <Progress value={analysis.seoScore} className="h-1" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Brand</span>
              <span className={getScoreColor(analysis.brandComplianceScore)}>{analysis.brandComplianceScore}%</span>
            </div>
            <Progress value={analysis.brandComplianceScore} className="h-1" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Readability</span>
              <span className={getScoreColor(analysis.readabilityScore)}>{analysis.readabilityScore}%</span>
            </div>
            <Progress value={analysis.readabilityScore} className="h-1" />
          </div>
        </div>

        <Separator />

        {/* AI Recommendation */}
        {recommendation && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              {getRecommendationIcon(recommendation.action)}
              AI Recommendation
              <Badge variant="outline">{recommendation.confidence}% confidence</Badge>
            </h4>
            <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
          </div>
        )}

        {/* Issues */}
        {analysis.issues.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Issues Found ({analysis.issues.length})</h4>
            <div className="space-y-2">
              {analysis.issues.slice(0, 3).map((issue) => (
                <div key={issue.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{issue.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {issue.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                  </div>
                </div>
              ))}
              {analysis.issues.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{analysis.issues.length - 3} more issues
                </p>
              )}
            </div>
          </div>
        )}

        {/* Top Suggestions */}
        {analysis.suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Suggestions ({analysis.suggestions.length})
            </h4>
            <div className="space-y-2">
              {analysis.suggestions.slice(0, 2).map((suggestion) => (
                <div key={suggestion.id} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{suggestion.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.impact} impact
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                  </div>
                </div>
              ))}
              {analysis.suggestions.length > 2 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{analysis.suggestions.length - 2} more suggestions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="space-y-2">
          <h4 className="font-medium">Summary</h4>
          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
        </div>
      </CardContent>
    </Card>
  );
};
