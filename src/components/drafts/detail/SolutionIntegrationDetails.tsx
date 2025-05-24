
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Puzzle, CheckCircle2, Target } from 'lucide-react';

interface SolutionIntegrationDetailsProps {
  draft: any;
  solutionMetrics: any;
}

export const SolutionIntegrationDetails = ({ draft, solutionMetrics }: SolutionIntegrationDetailsProps) => {
  const selectedSolution = draft.metadata?.selectedSolution;
  
  if (!selectedSolution) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Puzzle className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Solution Integration</h3>
          </div>
          <p className="text-muted-foreground">No solution selected for this content</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Puzzle className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Solution Integration Analysis</h3>
        </div>
        
        <div className="space-y-6">
          {/* Solution Overview */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h4 className="font-semibold text-foreground mb-3">{selectedSolution.name}</h4>
            <p className="text-muted-foreground mb-3">{selectedSolution.description}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedSolution.category}</Badge>
              {selectedSolution.targetAudience && selectedSolution.targetAudience.length > 0 && (
                <Badge variant="outline">
                  {selectedSolution.targetAudience.slice(0, 2).join(', ')}
                  {selectedSolution.targetAudience.length > 2 && ` +${selectedSolution.targetAudience.length - 2}`}
                </Badge>
              )}
            </div>
          </div>

          {/* Integration Metrics */}
          {solutionMetrics && (
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h4 className="font-medium text-foreground mb-4">Integration Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-md border border-border">
                  <div className="text-2xl font-bold text-primary">{solutionMetrics.featureIncorporation}%</div>
                  <div className="text-sm text-muted-foreground">Feature Integration</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-md border border-border">
                  <div className="text-2xl font-bold text-primary">{solutionMetrics.positioningScore}%</div>
                  <div className="text-sm text-muted-foreground">Positioning Score</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-md border border-border">
                  <div className="text-2xl font-bold text-primary">{solutionMetrics.nameMentions}</div>
                  <div className="text-sm text-muted-foreground">Name Mentions</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-md border border-border">
                  <div className="text-2xl font-bold text-primary">{solutionMetrics.audienceAlignment}%</div>
                  <div className="text-sm text-muted-foreground">Audience Alignment</div>
                </div>
              </div>
            </div>
          )}

          {/* Features Analysis */}
          {selectedSolution.features && selectedSolution.features.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h4 className="font-medium text-foreground mb-4">Features ({selectedSolution.features.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedSolution.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-border">
                    <CheckCircle2 className={`h-4 w-4 ${
                      solutionMetrics?.mentionedFeatures?.includes(feature) 
                        ? 'text-green-500' 
                        : 'text-muted-foreground'
                    }`} />
                    <span className={`text-sm ${
                      solutionMetrics?.mentionedFeatures?.includes(feature) 
                        ? 'text-foreground' 
                        : 'text-muted-foreground'
                    }`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pain Points Addressed */}
          {selectedSolution.painPoints && selectedSolution.painPoints.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h4 className="font-medium text-foreground mb-4">Pain Points Addressed</h4>
              <div className="space-y-2">
                {selectedSolution.painPoints.map((painPoint: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-muted/50 rounded-md border border-border">
                    <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{painPoint}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
