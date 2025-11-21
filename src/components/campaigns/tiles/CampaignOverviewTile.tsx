import { CampaignStrategy, CampaignStatus } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignOverviewTileProps {
  strategy: CampaignStrategy;
  status: CampaignStatus;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'text-gray-400', border: 'border-gray-500/50', bg: 'bg-gray-500/10' },
  planned: { label: 'Planned', color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-500/10' },
  active: { label: 'Active', color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-500/10' },
  completed: { label: 'Completed', color: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-500/10' },
  archived: { label: 'Archived', color: 'text-gray-400', border: 'border-gray-500/50', bg: 'bg-gray-500/10' },
} as const;

export const CampaignOverviewTile = ({ strategy, status }: CampaignOverviewTileProps) => {
  const config = statusConfig[status] || statusConfig.draft;
  
  // Calculate progress metrics
  const totalPieces = strategy.contentMix.reduce((sum, item) => sum + item.count, 0);
  const contentGenerated = 0; // This will be dynamically calculated from content_items table
  const progressPercentage = totalPieces > 0 ? (contentGenerated / totalPieces) * 100 : 0;
  
  // Calculate days remaining
  const timelineMap: Record<string, number> = {
    '1 week': 7,
    '2 weeks': 14,
    '4 weeks': 28,
    'ongoing': 0
  };
  const daysRemaining = timelineMap[strategy.timeline?.toLowerCase() || ''] || 0;
  
  // Determine next action
  const getNextAction = () => {
    if (contentGenerated === 0) return 'Start generating content';
    if (contentGenerated < totalPieces) return `${totalPieces - contentGenerated} pieces pending`;
    return 'Ready to publish';
  };

  return (
    <GlassCard className="p-6 bg-background/60 backdrop-blur-xl border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-purple-500/10">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Campaign Overview</h3>
        </div>
        <Badge 
          variant="outline" 
          className={cn("font-medium px-3 py-1.5 text-sm border-2", config.color, config.border, config.bg)}
        >
          {config.label}
        </Badge>
      </div>
      
      {/* Progress Tracker */}
      <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-card/50 via-card/70 to-card/50 border-2 border-green-500/20 shadow-lg shadow-green-500/10">
        <div className="flex justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-green-500/20">
              <Sparkles className="h-4 w-4 text-green-400" />
            </div>
            <span className="text-sm font-semibold">Content Progress</span>
          </div>
          <span className="text-sm font-black">{contentGenerated}/{totalPieces} pieces</span>
        </div>
        <div className="h-3 bg-background/60 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 shadow-lg shadow-green-500/50 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }} 
          />
        </div>
      </div>
      
      <div className="space-y-5">
        <div>
          <h4 className="text-2xl font-bold mb-3 tracking-tight leading-tight">{strategy.title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{strategy.description}</p>
        </div>

        {/* Days Remaining + Next Action */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/20 border-l-4 border-amber-500">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Days Remaining</p>
            </div>
            <p className="text-3xl font-black bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent">
              {daysRemaining > 0 ? daysRemaining : '∞'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{daysRemaining > 0 ? 'days left' : 'ongoing'}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-purple-500/30 border-l-4 border-purple-500 shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transition-all">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-medium">Next Action</p>
            <p className="text-sm font-bold">{getNextAction()}</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-card/40 border border-white/5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Goal</p>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Target className="h-4 w-4 text-purple-400" />
              </div>
              <p className="font-bold text-sm capitalize">{strategy.expectedEngagement || 'Not specified'}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card/40 border border-white/5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Target Audience</p>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <p className="font-bold text-sm line-clamp-2">{strategy.targetAudience || 'Not specified'}</p>
            </div>
          </div>
        </div>
        
        {/* Expected Results */}
        {strategy.expectedMetrics && (
          <div className="pt-5 border-t border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-full bg-blue-500/10">
                <Target className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Expected Results</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {strategy.expectedMetrics.impressions && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-card/40 via-card/60 to-card/40 border border-white/5">
                  <p className="text-xs text-muted-foreground mb-2">Impressions</p>
                  <p className="text-xl font-black bg-gradient-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    {strategy.expectedMetrics.impressions.min}K-{strategy.expectedMetrics.impressions.max}K
                  </p>
                </div>
              )}
              {strategy.expectedMetrics.engagement && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-card/40 via-card/60 to-card/40 border border-white/5">
                  <p className="text-xs text-muted-foreground mb-2">Engagement</p>
                  <p className="text-xl font-black bg-gradient-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    {strategy.expectedMetrics.engagement.min}-{strategy.expectedMetrics.engagement.max}%
                  </p>
                </div>
              )}
              {strategy.expectedMetrics.conversions && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-card/40 via-card/60 to-card/40 border border-white/5">
                  <p className="text-xs text-muted-foreground mb-2">Conversions</p>
                  <p className="text-xl font-black bg-gradient-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    {strategy.expectedMetrics.conversions.min}-{strategy.expectedMetrics.conversions.max}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};