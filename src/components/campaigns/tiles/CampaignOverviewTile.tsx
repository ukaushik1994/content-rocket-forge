import { CampaignStrategy, CampaignStatus } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignOverviewTileProps {
  strategy: CampaignStrategy;
  status: CampaignStatus;
  solution?: any | null;
  campaignObjective?: string;
}

const statusConfig = {
  draft: { label: 'Draft', variant: 'secondary' as const },
  planned: { label: 'Planned', variant: 'outline' as const },
  active: { label: 'Active', variant: 'default' as const },
  completed: { label: 'Completed', variant: 'secondary' as const },
  archived: { label: 'Archived', variant: 'secondary' as const },
} as const;

export const CampaignOverviewTile = ({ strategy, status, solution, campaignObjective }: CampaignOverviewTileProps) => {
  const config = statusConfig[status] || statusConfig.draft;
  
  const totalPieces = strategy.contentMix.reduce((sum, item) => sum + item.count, 0);
  const contentGenerated = 0;
  const progressPercentage = totalPieces > 0 ? (contentGenerated / totalPieces) * 100 : 0;
  
  const timelineMap: Record<string, number> = {
    '1 week': 7,
    '2 weeks': 14,
    '4 weeks': 28,
    'ongoing': 0
  };
  const daysRemaining = timelineMap[strategy.timeline?.toLowerCase() || ''] || 0;
  
  const getNextAction = () => {
    if (contentGenerated === 0) return 'Start generating content';
    if (contentGenerated < totalPieces) return `${totalPieces - contentGenerated} pieces pending`;
    return 'Ready to publish';
  };

  return (
    <GlassCard className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Campaign Overview</h3>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>
      
      {/* Solution Branding */}
      {solution && (
        <div className="mb-8 flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-muted/30">
          {solution.logo_url ? (
            <img 
              src={solution.logo_url} 
              alt={solution.name}
              className="h-12 w-12 rounded-lg object-contain"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Promoting</p>
            <p className="font-semibold truncate">{solution.name}</p>
          </div>
        </div>
      )}

      {/* Campaign Objective */}
      <div className="mb-8 pb-6 border-b border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Objective</p>
        </div>
        <p className="text-sm leading-relaxed">
          {campaignObjective || 
           `Launch a ${strategy.timeline || '4-week'} campaign targeting ${strategy.targetAudience || 'your audience'} with ${totalPieces} content pieces across ${strategy.contentMix.length} formats.`}
        </p>
      </div>
      
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-muted-foreground">Content Progress</span>
          <span className="text-sm font-medium">{contentGenerated}/{totalPieces}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.max(progressPercentage, 2)}%` }} 
          />
        </div>
      </div>
      
      {/* Title & Description */}
      <div className="mb-8">
        <h4 className="text-xl font-semibold mb-2">{strategy.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{strategy.description}</p>
      </div>

      {/* Quick Stats Row */}
      <div className="flex items-center gap-6 py-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-semibold">{daysRemaining > 0 ? daysRemaining : '∞'}</span>
            <span className="text-muted-foreground ml-1">days</span>
          </span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm capitalize">{strategy.expectedEngagement || 'Not set'}</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm truncate">{strategy.targetAudience || 'Not specified'}</span>
        </div>
      </div>

      {/* Next Action */}
      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <p className="text-sm">
          <span className="text-muted-foreground">Next: </span>
          <span className="font-medium">{getNextAction()}</span>
        </p>
      </div>
      
      {/* Expected Results */}
      {strategy.expectedMetrics && (
        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Expected Results</p>
          </div>
          <div className="flex items-center gap-8">
            {strategy.expectedMetrics.impressions && (
              <div>
                <p className="text-2xl font-semibold">
                  {strategy.expectedMetrics.impressions.min}K-{strategy.expectedMetrics.impressions.max}K
                </p>
                <p className="text-xs text-muted-foreground">Impressions</p>
              </div>
            )}
            {strategy.expectedMetrics.engagement && (
              <div>
                <p className="text-2xl font-semibold">
                  {strategy.expectedMetrics.engagement.min}-{strategy.expectedMetrics.engagement.max}%
                </p>
                <p className="text-xs text-muted-foreground">Engagement</p>
              </div>
            )}
            {strategy.expectedMetrics.conversions && (
              <div>
                <p className="text-2xl font-semibold">
                  {strategy.expectedMetrics.conversions.min}-{strategy.expectedMetrics.conversions.max}
                </p>
                <p className="text-xs text-muted-foreground">Conversions</p>
              </div>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );
};
