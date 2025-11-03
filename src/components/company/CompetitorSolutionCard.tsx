import { CompetitorSolution } from '@/contexts/content-builder/types/company-types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ExternalLink } from 'lucide-react';

interface CompetitorSolutionCardProps {
  solution: CompetitorSolution;
  onView: (solution: CompetitorSolution) => void;
}

export function CompetitorSolutionCard({ solution, onView }: CompetitorSolutionCardProps) {
  const featureCount = solution.features?.length || 0;
  const hasFullProfile = featureCount > 5;

  return (
    <Card className="group hover:border-primary/50 transition-all cursor-pointer bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:shadow-xl hover:scale-[1.02] duration-300" onClick={() => onView(solution)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
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

        {featureCount > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium">Key Features:</p>
            <ul className="space-y-0.5">
              {solution.features.slice(0, 3).map((feature: any, idx: number) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                  <span className="text-primary">•</span>
                  <span className="line-clamp-1">{typeof feature === 'string' ? feature : feature.name || feature.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1">
            {hasFullProfile && (
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                Full Profile
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
