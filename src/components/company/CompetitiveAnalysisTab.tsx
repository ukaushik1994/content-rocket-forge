import { CompetitorSolution } from '@/contexts/content-builder/types/company-types';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CompetitiveAnalysisTabProps {
  solution: CompetitorSolution;
}

export function CompetitiveAnalysisTab({ solution }: CompetitiveAnalysisTabProps) {
  const mapping = solution.metadata?.competitive_mapping;
  const metrics = solution.metadata?.competitive_metrics;

  if (!mapping && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted/50 p-6 mb-4">
          <TrendingUp className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          No competitive analysis available
        </p>
        <p className="text-xs text-muted-foreground max-w-md">
          This analysis requires your company information and solutions to be configured
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Feature Overlap</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{metrics.feature_overlap_count}</p>
            <p className="text-xs text-muted-foreground mt-1">Shared capabilities</p>
          </div>
          
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-600">Pain Points</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{metrics.pain_point_coverage_count}</p>
            <p className="text-xs text-muted-foreground mt-1">Of YOUR pain points</p>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-600">Audience Overlap</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{metrics.audience_overlap_count}</p>
            <p className="text-xs text-muted-foreground mt-1">Shared audiences</p>
          </div>
          
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-600">Feature Gaps</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{metrics.feature_gap_count}</p>
            <p className="text-xs text-muted-foreground mt-1">They don't have</p>
          </div>
        </div>
      )}

      {/* Feature Overlap */}
      {mapping?.featureOverlap && mapping.featureOverlap.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Feature Overlap with YOUR Solutions</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Features they offer that match your solutions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mapping.featureOverlap.map((feature: string, idx: number) => (
              <div key={idx} className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/20">
                <p className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Gaps - Your Advantages */}
      {mapping?.featureGaps && mapping.featureGaps.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold">Your Competitive Advantages</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Features YOU have that they don't offer
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mapping.featureGaps.map((feature: string, idx: number) => (
              <div key={idx} className="p-3 rounded-lg border bg-orange-500/5 border-orange-500/20">
                <p className="text-sm flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pain Point Coverage */}
      {mapping?.painPointCoverage && mapping.painPointCoverage.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Pain Points They Address (from YOUR list)</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Which of your identified pain points their solution solves
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mapping.painPointCoverage.map((painPoint: string, idx: number) => (
              <div key={idx} className="p-3 rounded-lg border bg-green-500/5 border-green-500/20">
                <p className="text-sm flex items-start gap-2">
                  <Target className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>{painPoint}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audience Overlap */}
      {mapping?.audienceOverlap && mapping.audienceOverlap.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Shared Target Audience</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Audience segments you both target
          </p>
          <div className="flex flex-wrap gap-2">
            {mapping.audienceOverlap.map((audience: string, idx: number) => (
              <Badge key={idx} variant="outline" className="border-purple-500/30 text-purple-600 bg-purple-500/5">
                {audience}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Their Differentiators */}
      {mapping?.differentiators && mapping.differentiators.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Their Unique Differentiators</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            What makes them unique in the market
          </p>
          <div className="space-y-2">
            {mapping.differentiators.map((diff: string, idx: number) => (
              <div key={idx} className="p-3 rounded-lg border bg-primary/5">
                <p className="text-sm flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">{idx + 1}.</span>
                  <span>{diff}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
