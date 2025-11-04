import { CompetitorSolution } from '@/contexts/content-builder/types/company-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Check, Minus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface CompetitorSolutionComparisonProps {
  solutions: CompetitorSolution[];
  onClose: () => void;
}

export function CompetitorSolutionComparison({ solutions, onClose }: CompetitorSolutionComparisonProps) {
  if (solutions.length === 0) return null;

  const allFeatures = Array.from(
    new Set(solutions.flatMap(s => s.features || []))
  );

  const getFeatureStatus = (solution: CompetitorSolution, feature: string) => {
    return solution.features?.includes(feature);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Compare Solutions ({solutions.length})</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <ScrollArea className="flex-1">
          <CardContent>
            {/* Solution Headers */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${solutions.length}, 1fr)` }}>
              <div className="font-semibold">Solution</div>
              {solutions.map(solution => (
                <div key={solution.id} className="space-y-2">
                  <div className="font-semibold text-sm">{solution.name}</div>
                  {solution.externalUrl && (
                    <a
                      href={solution.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Description Row */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${solutions.length}, 1fr)` }}>
              <div className="font-semibold">Description</div>
              {solutions.map(solution => (
                <div key={solution.id} className="text-sm text-muted-foreground">
                  {solution.shortDescription || solution.longDescription || 'No description'}
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Pricing Row */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${solutions.length}, 1fr)` }}>
              <div className="font-semibold">Pricing</div>
              {solutions.map(solution => (
                <div key={solution.id} className="text-sm">
                  {solution.pricing ? (
                    <div className="space-y-1">
                      {typeof solution.pricing === 'object' && 'model' in solution.pricing && (
                        <Badge variant="outline">{solution.pricing.model}</Badge>
                      )}
                      {typeof solution.pricing === 'object' && 'plans' in solution.pricing && Array.isArray(solution.pricing.plans) && solution.pricing.plans.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {solution.pricing.plans.length} plan(s)
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not available</span>
                  )}
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Features Comparison */}
            {allFeatures.length > 0 && (
              <>
                <div className="font-semibold mb-4">Features Comparison</div>
                <div className="space-y-2">
                  {allFeatures.map(feature => (
                    <div 
                      key={feature} 
                      className="grid gap-4 py-2 border-b last:border-0"
                      style={{ gridTemplateColumns: `200px repeat(${solutions.length}, 1fr)` }}
                    >
                      <div className="text-sm">{feature}</div>
                      {solutions.map(solution => (
                        <div key={solution.id} className="flex items-center justify-center">
                          {getFeatureStatus(solution, feature) ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Minus className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Technical Specs */}
            {solutions.some(s => s.technicalSpecs) && (
              <>
                <Separator className="my-4" />
                <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${solutions.length}, 1fr)` }}>
                  <div className="font-semibold">Technical Specs</div>
                  {solutions.map(solution => (
                    <div key={solution.id} className="text-sm">
                      {solution.technicalSpecs ? (
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(solution.technicalSpecs, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-muted-foreground">Not available</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
