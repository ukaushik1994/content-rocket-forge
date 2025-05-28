
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Target, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SolutionIntegrationDashboardProps {
  solution: any;
  solutionMetrics: any;
  isAnalyzing: boolean;
}

export const SolutionIntegrationDashboard = ({
  solution,
  solutionMetrics,
  isAnalyzing
}: SolutionIntegrationDashboardProps) => {

  if (isAnalyzing) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Solution Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Analyzing integration...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!solution) {
    return (
      <Card className="h-full border-purple-200 bg-purple-50/50 dark:bg-purple-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Solution Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-purple-500 mb-4" />
          <h3 className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-2">
            No Solution Selected
          </h3>
          <p className="text-sm text-purple-600 dark:text-purple-400 text-center">
            This draft wasn't created with a specific solution in mind.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate integration score based on available metrics
  const calculateIntegrationScore = () => {
    if (!solutionMetrics) return 0;
    
    let score = 0;
    
    // Check feature mentions
    if (solutionMetrics.featureMentions > 0) score += 30;
    
    // Check use case coverage
    if (solutionMetrics.useCaseCoverage > 0) score += 25;
    
    // Check pain point addressing
    if (solutionMetrics.painPointsAddressed > 0) score += 25;
    
    // Check target audience alignment
    if (solutionMetrics.targetAudienceAlignment > 0) score += 20;
    
    return Math.min(100, score);
  };

  const integrationScore = solutionMetrics ? calculateIntegrationScore() : 50; // Default score if no metrics
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Well Integrated';
    if (score >= 60) return 'Moderately Integrated';
    if (score >= 40) return 'Partially Integrated';
    return 'Poorly Integrated';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5" />
          Solution Integration
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(integrationScore)}`}>
              {integrationScore}%
            </span>
            <Badge variant="outline" className="text-xs">
              {getScoreLabel(integrationScore)}
            </Badge>
          </div>
        </div>
        <Progress value={integrationScore} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Solution Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{solution.name}</h4>
            {solution.externalUrl && (
              <Button variant="ghost" size="sm" className="h-6 px-2" asChild>
                <a href={solution.externalUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {solution.description || 'Business solution for content optimization'}
          </p>
          <Badge variant="secondary" className="text-xs w-fit">
            {solution.category || 'Business Solution'}
          </Badge>
        </div>

        {/* Integration Metrics */}
        {solutionMetrics ? (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Integration Analysis</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Features Mentioned</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{solutionMetrics.featureMentions || 0}</span>
                  {solutionMetrics.featureMentions > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Use Cases Covered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{solutionMetrics.useCaseCoverage || 0}</span>
                  {solutionMetrics.useCaseCoverage > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Pain Points Addressed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{solutionMetrics.painPointsAddressed || 0}</span>
                  {solutionMetrics.painPointsAddressed > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Audience Alignment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{solutionMetrics.targetAudienceAlignment || 0}%</span>
                  {solutionMetrics.targetAudienceAlignment > 50 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Solution Details</h4>
            
            {/* Features */}
            {solution.features && solution.features.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Key Features</span>
                <div className="flex flex-wrap gap-1">
                  {solution.features.slice(0, 3).map((feature: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {solution.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{solution.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {/* Use Cases */}
            {solution.useCases && solution.useCases.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Use Cases</span>
                <div className="flex flex-wrap gap-1">
                  {solution.useCases.slice(0, 2).map((useCase: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {useCase}
                    </Badge>
                  ))}
                  {solution.useCases.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{solution.useCases.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {/* Target Audience */}
            {solution.targetAudience && solution.targetAudience.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Target Audience</span>
                <div className="flex flex-wrap gap-1">
                  {solution.targetAudience.slice(0, 2).map((audience: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {audience}
                    </Badge>
                  ))}
                  {solution.targetAudience.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{solution.targetAudience.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-2 pt-2 border-t">
          <h4 className="font-medium text-sm">Recommendations</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            {!solutionMetrics || solutionMetrics.featureMentions === 0 ? (
              <p>• Mention key solution features more prominently</p>
            ) : null}
            {!solutionMetrics || solutionMetrics.useCaseCoverage === 0 ? (
              <p>• Include specific use case examples</p>
            ) : null}
            {!solutionMetrics || solutionMetrics.painPointsAddressed === 0 ? (
              <p>• Address customer pain points the solution solves</p>
            ) : null}
            {!solutionMetrics || solutionMetrics.targetAudienceAlignment < 50 ? (
              <p>• Better align content with target audience needs</p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
