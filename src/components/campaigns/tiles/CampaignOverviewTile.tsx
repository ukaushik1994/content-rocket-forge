import { CampaignStrategy, CampaignStatus } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Sparkles } from 'lucide-react';

interface CampaignOverviewTileProps {
  strategy: CampaignStrategy;
  status: CampaignStatus;
}

const statusConfig = {
  draft: { color: 'from-gray-500/20 to-gray-500/30 text-gray-300', label: 'Draft' },
  planned: { color: 'from-blue-500/20 to-blue-500/30 text-blue-300', label: 'Planned' },
  active: { color: 'from-purple-500/20 to-purple-500/30 text-purple-300', label: 'Active' },
  completed: { color: 'from-green-500/20 to-green-500/30 text-green-300', label: 'Completed' },
  archived: { color: 'from-gray-500/20 to-gray-500/30 text-gray-300', label: 'Archived' },
};

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
        <Badge variant="outline" className="font-medium px-3 py-1.5 text-sm">{config.label}</Badge>
      </div>
      
      {/* Progress Tracker */}
      <div className="mb-6 p-4 rounded-xl bg-card/40 border border-white/5">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Content Progress</span>
          <span className="text-sm font-bold">{contentGenerated}/{totalPieces} pieces</span>
        </div>
        <div className="h-2.5 bg-background/60 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
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
          <div className="p-4 rounded-xl bg-card/40 border border-white/5">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Days Remaining</p>
            <p className="text-2xl font-bold">{daysRemaining > 0 ? `${daysRemaining} days` : 'Ongoing'}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-purple-500/30 border-l-4 border-purple-500">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Next Action</p>
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
            <p className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Expected Results</p>
            <div className="grid grid-cols-3 gap-4">
              {strategy.expectedMetrics.impressions && (
                <div className="p-4 rounded-xl bg-card/40 border border-white/5">
                  <p className="text-xs text-muted-foreground mb-1">Impressions</p>
                  <p className="text-lg font-bold">
                    {strategy.expectedMetrics.impressions.min}K-{strategy.expectedMetrics.impressions.max}K
                  </p>
                </div>
              )}
              {strategy.expectedMetrics.engagement && (
                <div className="p-4 rounded-xl bg-card/40 border border-white/5">
                  <p className="text-xs text-muted-foreground mb-1">Engagement</p>
                  <p className="text-lg font-bold">
                    {strategy.expectedMetrics.engagement.min}-{strategy.expectedMetrics.engagement.max}%
                  </p>
                </div>
              )}
              {strategy.expectedMetrics.conversions && (
                <div className="p-4 rounded-xl bg-card/40 border border-white/5">
                  <p className="text-xs text-muted-foreground mb-1">Conversions</p>
                  <p className="text-lg font-bold">
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