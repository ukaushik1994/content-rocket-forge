
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart3, TrendingUp, Target, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetadataAnalyticsProps {
  draft: any;
  isAnalyzing: boolean;
  analysisData: any;
  formatDate: (dateString: string) => string;
}

export const MetadataAnalytics: React.FC<MetadataAnalyticsProps> = ({
  draft,
  isAnalyzing,
  analysisData,
  formatDate
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <motion.div
            className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-lg text-muted-foreground">Analyzing content...</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-1">
        {/* SEO Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  SEO Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className={`text-3xl font-bold ${getScoreColor(draft.seo_score || 0)}`}>
                    {draft.seo_score || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getScoreDescription(draft.seo_score || 0)}
                  </div>
                  <Progress 
                    value={draft.seo_score || 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Readability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-3xl font-bold text-green-500">
                    85%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Easy to Read
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Keyword Density
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-3xl font-bold text-blue-500">
                    2.3%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Optimal Range
                  </div>
                  <Progress value={77} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Content Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Content Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge variant={draft.status === 'draft' ? 'outline' : 'default'}>
                      {draft.status === 'draft' ? 'Draft' : 'Published'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Content Type</div>
                    <div className="text-sm font-medium">{draft.contentType || 'Article'}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Created</div>
                    <div className="text-sm font-medium">{formatDate(draft.created_at)}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Updated</div>
                    <div className="text-sm font-medium">{formatDate(draft.updated_at)}</div>
                  </div>
                </div>

                {(draft.metaTitle || draft.metaDescription) && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium mb-3">Meta Information</h4>
                    {draft.metaTitle && (
                      <div className="space-y-1 mb-3">
                        <div className="text-xs text-muted-foreground">Meta Title</div>
                        <div className="text-sm p-2 bg-background/50 rounded border">{draft.metaTitle}</div>
                      </div>
                    )}
                    {draft.metaDescription && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Meta Description</div>
                        <div className="text-sm p-2 bg-background/50 rounded border">{draft.metaDescription}</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Keywords Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Keywords Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {draft.keywords && draft.keywords.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Keywords</span>
                        <Badge variant="secondary">{draft.keywords.length}</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Keywords</div>
                      <div className="flex flex-wrap gap-2">
                        {draft.keywords.map((keyword: string, idx: number) => (
                          <Badge 
                            key={idx}
                            variant={idx === 0 ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {analysisData.keywordUsage.length > 0 && (
                      <div className="pt-4 border-t border-border">
                        <div className="text-sm font-medium mb-2">Usage Analysis</div>
                        <div className="space-y-2">
                          {analysisData.keywordUsage.slice(0, 3).map((usage: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="truncate">{usage.keyword}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{usage.count}x</span>
                                <Badge variant="outline" className="text-xs">
                                  {usage.density}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No keywords available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* SERP Analysis Summary */}
        {draft.metadata?.serpMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  SERP Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-background/50 rounded border">
                    <div className="text-xl font-bold text-orange-500">
                      {draft.metadata.serpMetrics.totalResults || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Results</div>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded border">
                    <div className="text-xl font-bold text-orange-500">
                      {draft.metadata.serpMetrics.competitorAnalyzed || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Competitors</div>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded border">
                    <div className="text-xl font-bold text-orange-500">
                      {draft.metadata.serpMetrics.contentGapsFound || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Content Gaps</div>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded border">
                    <div className="text-xl font-bold text-orange-500">
                      {draft.metadata.serpMetrics.avgCompetitorLength || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Length</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </ScrollArea>
  );
};
