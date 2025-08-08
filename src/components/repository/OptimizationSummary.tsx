import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Search, 
  Brain, 
  Database, 
  Zap, 
  TrendingUp, 
  Award,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface OptimizationSummaryProps {
  metadata?: any;
}

export const OptimizationSummary: React.FC<OptimizationSummaryProps> = ({ metadata }) => {
  if (!metadata?.optimizationMetadata) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Optimization Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No optimization data available for this content.
          </p>
        </CardContent>
      </Card>
    );
  }

  const optimizationData = metadata.optimizationMetadata;
  const seoScore = metadata.seoScore || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Content Quality Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Content Quality
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {optimizationData.qualityMetrics && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion</span>
                <span className="text-sm text-muted-foreground">
                  {optimizationData.qualityMetrics.completionPercentage}%
                </span>
              </div>
              <Progress value={optimizationData.qualityMetrics.completionPercentage} className="h-2" />
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${optimizationData.qualityMetrics.hasTitle ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs">Title</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${optimizationData.qualityMetrics.hasMetaTitle ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs">Meta Title</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${optimizationData.qualityMetrics.hasMetaDescription ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs">Meta Description</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${optimizationData.qualityMetrics.hasKeywords ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs">Keywords</span>
                </div>
              </div>
            </div>
          )}

          {optimizationData.contentAnalysis?.wordCount && (
            <div className="flex items-center justify-between text-sm">
              <span>Word Count</span>
              <span className="font-medium">{optimizationData.contentAnalysis.wordCount.toLocaleString()}</span>
            </div>
          )}

          {optimizationData.contentAnalysis?.readingTime && (
            <div className="flex items-center justify-between text-sm">
              <span>Reading Time</span>
              <span className="font-medium">{optimizationData.contentAnalysis.readingTime} min</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SEO Score</span>
              <span className="text-sm text-muted-foreground">{seoScore}/100</span>
            </div>
            <Progress value={seoScore} className="h-2" />
          </div>

          {metadata.mainKeyword && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Main Keyword</div>
              <CustomBadge className="bg-primary/10 text-primary border-primary/20">
                {metadata.mainKeyword}
              </CustomBadge>
            </div>
          )}

          {metadata.secondaryKeywords?.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Secondary Keywords ({metadata.secondaryKeywords.length})</div>
              <div className="flex flex-wrap gap-1">
                {metadata.secondaryKeywords.slice(0, 3).map((keyword: string, index: number) => (
                  <CustomBadge key={index} className="text-xs bg-muted/50 text-muted-foreground">
                    {keyword}
                  </CustomBadge>
                ))}
                {metadata.secondaryKeywords.length > 3 && (
                  <CustomBadge className="text-xs bg-muted/50 text-muted-foreground">
                    +{metadata.secondaryKeywords.length - 3}
                  </CustomBadge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Solution Integration */}
      {metadata.selectedSolution && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Solution Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {metadata.selectedSolution.logoUrl ? (
                <div className="h-8 w-8 rounded overflow-hidden bg-background border">
                  <img
                    src={metadata.selectedSolution.logoUrl}
                    alt={`${metadata.selectedSolution.name} logo`}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-8 w-8 rounded bg-muted text-foreground grid place-items-center text-sm font-semibold">
                  {metadata.selectedSolution.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-medium">{metadata.selectedSolution.name}</div>
                {metadata.selectedSolution.category && (
                  <div className="text-xs text-muted-foreground">{metadata.selectedSolution.category}</div>
                )}
              </div>
            </div>

            {optimizationData.solutionAnalysis && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Integration Score</span>
                  <span className="text-sm text-muted-foreground">
                    {optimizationData.solutionAnalysis.integrationScore}%
                  </span>
                </div>
                <Progress value={optimizationData.solutionAnalysis.integrationScore} className="h-2" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Features</div>
                    <div className="font-medium">{optimizationData.solutionAnalysis.featureIncorporation}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Mentions</div>
                    <div className="font-medium">{optimizationData.solutionAnalysis.nameMentions}</div>
                  </div>
                </div>

                {optimizationData.solutionAnalysis.mentionedFeatures?.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Mentioned Features</div>
                    <div className="flex flex-wrap gap-1">
                      {optimizationData.solutionAnalysis.mentionedFeatures.slice(0, 3).map((feature: string, index: number) => (
                        <CustomBadge key={index} className="text-xs bg-blue-500/10 text-blue-700 border-blue-500/20">
                          {feature}
                        </CustomBadge>
                      ))}
                      {optimizationData.solutionAnalysis.mentionedFeatures.length > 3 && (
                        <CustomBadge className="text-xs bg-muted/50 text-muted-foreground">
                          +{optimizationData.solutionAnalysis.mentionedFeatures.length - 3}
                        </CustomBadge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SERP Integration */}
      {metadata.selectionStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              SERP Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total SERP Items</span>
              <span className="text-sm text-muted-foreground">{metadata.selectionStats.totalSelected}</span>
            </div>

            {metadata.selectionStats.byType && (
              <div className="space-y-2">
                <div className="text-sm font-medium">By Type</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(metadata.selectionStats.byType)
                    .filter(([, count]) => typeof count === 'number' && count > 0)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize">{type.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {optimizationData.serpIntegration && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Integration Score</span>
                  <span className="text-sm text-muted-foreground">
                    {optimizationData.serpIntegration.integrationScore}%
                  </span>
                </div>
                <Progress value={optimizationData.serpIntegration.integrationScore} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Detection & Optimization */}
      {optimizationData.aiDetection && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Content Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {optimizationData.aiDetection.isAIContent ? (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm">
                {optimizationData.aiDetection.isAIContent 
                  ? 'AI-generated content detected' 
                  : 'Natural content detected'
                }
              </span>
            </div>

            {optimizationData.aiDetection.humanizationRequired && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-orange-700">
                  <Info className="h-4 w-4" />
                  Humanization improvements were suggested to make the content sound more natural.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};