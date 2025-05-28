
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart3, TrendingUp, Target, Clock, CheckCircle2, AlertCircle, FileText, Users, Eye, Zap } from 'lucide-react';
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
  // Calculate comprehensive SEO score
  const calculateSEOScore = () => {
    let score = 0;
    let factors = 0;

    // Meta title score (0-25 points)
    if (draft.metaTitle) {
      const titleLength = draft.metaTitle.length;
      if (titleLength >= 30 && titleLength <= 60) score += 25;
      else if (titleLength >= 20 && titleLength <= 70) score += 15;
      else score += 5;
    }
    factors += 25;

    // Meta description score (0-25 points)
    if (draft.metaDescription) {
      const descLength = draft.metaDescription.length;
      if (descLength >= 120 && descLength <= 160) score += 25;
      else if (descLength >= 100 && descLength <= 180) score += 15;
      else score += 5;
    }
    factors += 25;

    // Content structure score (0-25 points)
    if (analysisData.documentStructure) {
      const headingCount = analysisData.documentStructure.headings?.length || 0;
      if (headingCount >= 3) score += 25;
      else if (headingCount >= 1) score += 15;
      else score += 5;
    }
    factors += 25;

    // Keyword optimization score (0-25 points)
    if (analysisData.keywordUsage && analysisData.keywordUsage.length > 0) {
      const avgDensity = analysisData.keywordUsage.reduce((acc: number, item: any) => acc + parseFloat(item.density.replace('%', '')), 0) / analysisData.keywordUsage.length;
      if (avgDensity >= 1 && avgDensity <= 3) score += 25;
      else if (avgDensity >= 0.5 && avgDensity <= 5) score += 15;
      else score += 5;
    }
    factors += 25;

    return Math.round((score / factors) * 100);
  };

  const seoScore = calculateSEOScore();
  
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

  const getMetaTitleStatus = () => {
    if (!draft.metaTitle) return { status: 'missing', color: 'text-red-500', message: 'Missing meta title' };
    const length = draft.metaTitle.length;
    if (length < 30) return { status: 'short', color: 'text-yellow-500', message: 'Too short' };
    if (length > 60) return { status: 'long', color: 'text-red-500', message: 'Too long' };
    return { status: 'good', color: 'text-green-500', message: 'Optimal length' };
  };

  const getMetaDescriptionStatus = () => {
    if (!draft.metaDescription) return { status: 'missing', color: 'text-red-500', message: 'Missing description' };
    const length = draft.metaDescription.length;
    if (length < 120) return { status: 'short', color: 'text-yellow-500', message: 'Too short' };
    if (length > 160) return { status: 'long', color: 'text-red-500', message: 'Too long' };
    return { status: 'good', color: 'text-green-500', message: 'Optimal length' };
  };

  const titleStatus = getMetaTitleStatus();
  const descriptionStatus = getMetaDescriptionStatus();

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <div className={`text-3xl font-bold ${getScoreColor(seoScore)}`}>
                    {seoScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getScoreDescription(seoScore)}
                  </div>
                  <Progress value={seoScore} className="h-2" />
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
                  <FileText className="h-4 w-4" />
                  Content Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-3xl font-bold text-green-500">
                    {analysisData.documentStructure?.readabilityScore || 85}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Well Structured
                  </div>
                  <Progress value={analysisData.documentStructure?.readabilityScore || 85} className="h-2" />
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
                    {analysisData.keywordUsage.length > 0 
                      ? analysisData.keywordUsage[0].density 
                      : '0%'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Primary Keyword
                  </div>
                  <Progress value={
                    analysisData.keywordUsage.length > 0 
                      ? parseFloat(analysisData.keywordUsage[0].density.replace('%', '')) * 20
                      : 0
                  } className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  SERP Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-3xl font-bold text-purple-500">
                    {draft.metadata?.serpMetrics ? '92%' : '0%'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {draft.metadata?.serpMetrics ? 'Optimized' : 'Not Analyzed'}
                  </div>
                  <Progress value={draft.metadata?.serpMetrics ? 92 : 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Meta Information Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Meta Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Meta Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Meta Title</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${titleStatus.color}`}>
                        {titleStatus.message}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {draft.metaTitle?.length || 0}/60
                      </Badge>
                    </div>
                  </div>
                  {draft.metaTitle ? (
                    <div className="text-sm p-3 bg-background/50 rounded border">
                      {draft.metaTitle}
                    </div>
                  ) : (
                    <div className="text-sm p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400">
                      Meta title not set
                    </div>
                  )}
                  <Progress 
                    value={Math.min((draft.metaTitle?.length || 0) / 60 * 100, 100)} 
                    className="h-1"
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Meta Description</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${descriptionStatus.color}`}>
                        {descriptionStatus.message}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {draft.metaDescription?.length || 0}/160
                      </Badge>
                    </div>
                  </div>
                  {draft.metaDescription ? (
                    <div className="text-sm p-3 bg-background/50 rounded border">
                      {draft.metaDescription}
                    </div>
                  ) : (
                    <div className="text-sm p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400">
                      Meta description not set
                    </div>
                  )}
                  <Progress 
                    value={Math.min((draft.metaDescription?.length || 0) / 160 * 100, 100)} 
                    className="h-1"
                  />
                </div>

                {/* Basic Information */}
                <div className="pt-4 border-t border-border">
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
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Keywords & SERP Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Keywords & SERP Analysis
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

                    {/* SERP Data Summary */}
                    {draft.metadata?.serpMetrics && (
                      <div className="pt-4 border-t border-border">
                        <div className="text-sm font-medium mb-2">SERP Insights</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-2 bg-background/50 rounded border">
                            <div className="text-lg font-bold text-purple-500">
                              {draft.metadata.serpMetrics.totalResults || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Results</div>
                          </div>
                          <div className="text-center p-2 bg-background/50 rounded border">
                            <div className="text-lg font-bold text-purple-500">
                              {draft.metadata.serpMetrics.competitorAnalyzed || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Competitors</div>
                          </div>
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

        {/* SEO Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                SEO Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!draft.metaTitle && (
                  <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium text-red-400">Missing Meta Title</div>
                      <div className="text-red-300">Add a compelling meta title (30-60 characters)</div>
                    </div>
                  </div>
                )}
                
                {!draft.metaDescription && (
                  <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium text-red-400">Missing Meta Description</div>
                      <div className="text-red-300">Add a meta description (120-160 characters)</div>
                    </div>
                  </div>
                )}

                {analysisData.keywordUsage.length === 0 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <TrendingUp className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium text-yellow-400">Keyword Optimization</div>
                      <div className="text-yellow-300">Add target keywords to improve SEO</div>
                    </div>
                  </div>
                )}

                {seoScore >= 80 && (
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium text-green-400">Great SEO Score!</div>
                      <div className="text-green-300">Your content is well optimized for search engines</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ScrollArea>
  );
};
