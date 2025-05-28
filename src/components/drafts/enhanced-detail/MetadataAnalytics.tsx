
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  FileText, 
  Target, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { calculateReadabilityMetrics, calculateTechnicalSeoMetrics, calculateContentQualityMetrics } from '@/utils/content-analytics/calculateContentMetrics';
import { calculateKeywordUsage } from '@/utils/seo/keywordAnalysis';

interface MetadataAnalyticsProps {
  draft: any;
  isAnalyzing: boolean;
  analysisData: any;
  formatDate: (dateString: string) => string;
}

export const MetadataAnalytics = ({ 
  draft, 
  isAnalyzing, 
  analysisData, 
  formatDate 
}: MetadataAnalyticsProps) => {
  
  // Calculate comprehensive analytics
  const readabilityMetrics = React.useMemo(() => {
    if (!draft?.content) return null;
    return calculateReadabilityMetrics(draft.content);
  }, [draft?.content]);

  const technicalMetrics = React.useMemo(() => {
    if (!draft?.content) return null;
    return calculateTechnicalSeoMetrics(
      draft.content, 
      draft.metaTitle, 
      draft.metaDescription
    );
  }, [draft?.content, draft?.metaTitle, draft?.metaDescription]);

  const keywordUsage = React.useMemo(() => {
    if (!draft?.content || !draft?.keywords?.length) return [];
    
    try {
      const mainKeyword = draft.keywords[0];
      const selectedKeywords = draft.keywords.slice(1);
      return calculateKeywordUsage(draft.content, mainKeyword, selectedKeywords);
    } catch (error) {
      console.error('Error calculating keyword usage:', error);
      return [];
    }
  }, [draft?.content, draft?.keywords]);

  const qualityMetrics = React.useMemo(() => {
    if (!readabilityMetrics || !technicalMetrics) return null;
    return calculateContentQualityMetrics(readabilityMetrics, technicalMetrics, keywordUsage);
  }, [readabilityMetrics, technicalMetrics, keywordUsage]);

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
        <span className="text-lg text-muted-foreground">Analyzing content...</span>
      </div>
    );
  }

  if (!draft?.content) {
    return (
      <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-700 dark:text-yellow-300 mb-2">
            No Content Available
          </h3>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            This draft doesn't have content to analyze.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-1">
        {/* Overall Quality Score */}
        {qualityMetrics && (
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Content Quality Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-primary">
                  {qualityMetrics.overallScore}%
                </span>
                <Badge 
                  variant={qualityMetrics.overallScore >= 80 ? 'default' : 
                          qualityMetrics.overallScore >= 60 ? 'secondary' : 'outline'}
                  className="text-sm px-3 py-1"
                >
                  {qualityMetrics.overallScore >= 80 ? 'Excellent' : 
                   qualityMetrics.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Structure</span>
                  <span className="text-sm font-medium">{qualityMetrics.structureScore}%</span>
                </div>
                <Progress value={qualityMetrics.structureScore} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">SEO Optimization</span>
                  <span className="text-sm font-medium">{qualityMetrics.keywordOptimizationScore}%</span>
                </div>
                <Progress value={qualityMetrics.keywordOptimizationScore} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Readability</span>
                  <span className="text-sm font-medium">{qualityMetrics.readabilityScore}%</span>
                </div>
                <Progress value={qualityMetrics.readabilityScore} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Readability Metrics */}
          {readabilityMetrics && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Readability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Words</span>
                  <span className="font-medium">{readabilityMetrics.wordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sentences</span>
                  <span className="font-medium">{readabilityMetrics.sentenceCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Words/Sentence</span>
                  <span className="font-medium">{readabilityMetrics.avgWordsPerSentence}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reading Level</span>
                  <Badge variant="outline" className="text-xs">
                    {readabilityMetrics.grade}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical SEO Metrics */}
          {technicalMetrics && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" />
                  Technical SEO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Headings</span>
                  <span className="font-medium">{technicalMetrics.headingCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Links</span>
                  <span className="font-medium">{technicalMetrics.linkCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Images</span>
                  <span className="font-medium">{technicalMetrics.imageCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Meta Title</span>
                  {technicalMetrics.hasMetaTitle ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Meta Description</span>
                  {technicalMetrics.hasMetaDescription ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Keyword Usage */}
        {keywordUsage.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Keyword Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {keywordUsage.slice(0, 5).map((usage, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate flex-1 mr-3">
                      {usage.keyword}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {usage.count}×
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {usage.density}
                      </Badge>
                    </div>
                  </div>
                ))}
                {keywordUsage.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{keywordUsage.length - 5} more keywords
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Draft Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Draft Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={draft.status === 'draft' ? 'outline' : 'default'}>
                {draft.status === 'draft' ? 'Draft' : 'Published'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">SEO Score</span>
              <span className="font-medium">{draft.seo_score || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">{formatDate(draft.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Updated</span>
              <span className="text-sm">{formatDate(draft.updated_at)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};
