import { CompetitorSolution } from '@/contexts/content-builder/types/company-types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, ExternalLink } from 'lucide-react';

interface CompetitorSolutionCardProps {
  solution: CompetitorSolution;
  onView: (solution: CompetitorSolution) => void;
  isSelected?: boolean;
  onToggleSelect?: (solutionId: string) => void;
}

export function CompetitorSolutionCard({ solution, onView, isSelected = false, onToggleSelect }: CompetitorSolutionCardProps) {
  const featureCount = solution.features?.length || 0;
  const hasFullProfile = featureCount > 5;

  return (
    <Card className="group hover:border-primary/50 transition-all cursor-pointer bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:shadow-xl hover:scale-[1.02] duration-300" onClick={() => onView(solution)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {onToggleSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(solution.id)}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
          )}
          {solution.logoUrl ? (
            <img src={solution.logoUrl} alt={solution.name} className="w-10 h-10 rounded object-cover" />
          ) : (
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
              {solution.name}
            </h3>
            {solution.category && (
              <Badge variant="secondary" className="mt-1 text-xs bg-primary/20 text-primary border-primary/30">
                {solution.category}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {solution.shortDescription && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {solution.shortDescription}
          </p>
        )}

        {/* Stats Summary */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {featureCount > 0 && <span>{featureCount} features</span>}
          {solution.useCases?.length > 0 && <span>• {solution.useCases.length} use cases</span>}
          {solution.painPoints?.length > 0 && <span>• {solution.painPoints.length} pain points</span>}
        </div>

        {/* Features Section */}
        {featureCount > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium">Key Features</p>
            <div className="flex flex-wrap gap-1">
              {solution.features.slice(0, 3).map((feature: any, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/30">
                  {typeof feature === 'string' ? feature : feature.name || feature.title}
                </Badge>
              ))}
              {featureCount > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{featureCount - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Use Cases Section */}
        {solution.useCases?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium">Use Cases</p>
            <div className="flex flex-wrap gap-1">
              {solution.useCases.slice(0, 2).map((useCase: any, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30">
                  {typeof useCase === 'string' ? useCase : useCase.title || useCase.name}
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

        {/* Pain Points Section */}
        {solution.painPoints?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium">Solves</p>
            <div className="flex flex-wrap gap-1">
              {solution.painPoints.slice(0, 2).map((painPoint: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                  {painPoint}
                </Badge>
              ))}
              {solution.painPoints.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{solution.painPoints.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Target Audience */}
        {solution.targetAudience?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium">For</p>
            <div className="flex flex-wrap gap-1">
              {solution.targetAudience.slice(0, 2).map((audience: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {audience}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quality Indicators */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex flex-wrap gap-1">
            {solution.metadata?.data_quality === 'high' && (
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                High Quality
              </Badge>
            )}
            {solution.metadata?.data_quality === 'medium' && (
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                Medium Quality
              </Badge>
            )}
            {solution.metadata?.data_quality === 'low' && (
              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/30">
                Low Quality
              </Badge>
            )}
            {solution.metadata?.completeness_score && (
              <Badge variant="outline" className="text-xs">
                {solution.metadata.completeness_score}% complete
              </Badge>
            )}
            {solution.pricing && (
              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30">
                Pricing Available
              </Badge>
            )}
          </div>
          {solution.externalUrl && (
            <a
              href={solution.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <Button size="sm" variant="outline" className="w-full" onClick={() => onView(solution)}>
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
