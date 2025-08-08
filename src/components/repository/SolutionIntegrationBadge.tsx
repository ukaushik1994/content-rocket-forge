import React from 'react';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Zap, Star, TrendingUp, Target, Award } from 'lucide-react';

interface SolutionIntegrationBadgeProps {
  metadata?: any;
}

export const SolutionIntegrationBadge: React.FC<SolutionIntegrationBadgeProps> = ({ metadata }) => {
  if (!metadata?.selectedSolution) return null;

  const solution = metadata.selectedSolution;
  const integrationMetrics = metadata.solutionIntegrationMetrics;
  const optimizationData = metadata.optimizationMetadata?.solutionAnalysis;

  // Get integration score from multiple sources
  const integrationScore = 
    optimizationData?.integrationScore || 
    integrationMetrics?.overallScore || 
    0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
    return 'bg-red-500/20 text-red-700 border-red-500/30';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return Award;
    if (score >= 60) return Star;
    return Target;
  };

  const ScoreIcon = getScoreIcon(integrationScore);

  return (
    <div className="flex items-center gap-2">
      {/* Solution Logo/Name */}
      <div className="flex items-center gap-1">
        {solution.logoUrl ? (
          <div className="h-5 w-5 rounded overflow-hidden bg-background/80 border">
            <img
              src={solution.logoUrl}
              alt={`${solution.name} logo`}
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="h-5 w-5 rounded bg-muted text-foreground grid place-items-center text-xs font-semibold">
            {solution.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
        )}
        <span className="text-xs font-medium text-muted-foreground">
          {solution.name}
        </span>
      </div>

      {/* Integration Score Badge */}
      {integrationScore > 0 && (
        <CustomBadge className={`text-xs flex items-center gap-1 ${getScoreColor(integrationScore)}`}>
          <ScoreIcon className="h-3 w-3" />
          {integrationScore}%
        </CustomBadge>
      )}

      {/* Feature Integration Indicator */}
      {integrationMetrics?.featureIncorporation > 0 && (
        <CustomBadge className="text-xs bg-blue-500/20 text-blue-700 border-blue-500/30 flex items-center gap-1">
          <Zap className="h-3 w-3" />
          {integrationMetrics.featureIncorporation}% features
        </CustomBadge>
      )}

      {/* Mentions Counter */}
      {(integrationMetrics?.nameMentions || optimizationData?.nameMentions) > 0 && (
        <CustomBadge className="text-xs bg-purple-500/20 text-purple-700 border-purple-500/30 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {integrationMetrics?.nameMentions || optimizationData?.nameMentions} mentions
        </CustomBadge>
      )}
    </div>
  );
};