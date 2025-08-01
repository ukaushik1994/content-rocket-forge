
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SeoRecommendation } from '@/services/seoOptimizationService';
import { Lightbulb, AlertTriangle, Info, Zap, CheckCircle } from 'lucide-react';

interface RecommendationsPanelProps {
  recommendations: SeoRecommendation[];
  onApplyRecommendation: (recommendation: SeoRecommendation) => void;
  isAnalyzing: boolean;
}

export function RecommendationsPanel({ 
  recommendations, 
  onApplyRecommendation, 
  isAnalyzing 
}: RecommendationsPanelProps) {
  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Generating Recommendations...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            SEO Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recommendations available</p>
            <p className="text-sm mt-2">Run an analysis to get personalized recommendations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'major': return <Zap className="h-4 w-4" />;
      case 'minor': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'major': return 'default';
      case 'minor': return 'secondary';
      default: return 'secondary';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          SEO Recommendations ({recommendations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`p-4 border rounded-lg ${
                recommendation.applied ? 'bg-green-50 border-green-200' : 'bg-background'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getTypeIcon(recommendation.type)}
                  <Badge variant={getTypeColor(recommendation.type) as any}>
                    {recommendation.type}
                  </Badge>
                  <Badge variant="outline">{recommendation.category}</Badge>
                  {recommendation.applied && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Applied
                    </Badge>
                  )}
                </div>
                {recommendation.autoApplicable && !recommendation.applied && (
                  <Button
                    size="sm"
                    onClick={() => onApplyRecommendation(recommendation)}
                    variant="outline"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Apply
                  </Button>
                )}
              </div>

              <h4 className="font-medium mb-2">{recommendation.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {recommendation.description}
              </p>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Impact:</span>
                  <span className={`font-medium ${getImpactColor(recommendation.impact)}`}>
                    {recommendation.impact}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Effort:</span>
                  <span className={`font-medium ${getEffortColor(recommendation.effort)}`}>
                    {recommendation.effort}
                  </span>
                </div>
                {!recommendation.autoApplicable && (
                  <Badge variant="outline" className="text-xs">
                    Manual
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
