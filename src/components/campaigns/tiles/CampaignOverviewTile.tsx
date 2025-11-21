import { CampaignStrategy, CampaignStatus } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, Users, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  return (
    <GlassCard className="p-8 bg-gradient-to-br from-background/40 via-background/60 to-background/40 backdrop-blur-2xl border-2 border-transparent bg-gradient-to-br before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-purple-500/20 before:via-transparent before:to-blue-500/20 before:-z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-purple-500/10">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Campaign Overview</h3>
        </div>
        <Badge className={cn("font-bold px-3 py-1.5 text-sm bg-gradient-to-r", config.color)}>{config.label}</Badge>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-3xl font-extrabold mb-3 tracking-tight">{strategy.title}</h4>
          <p className="text-base text-muted-foreground leading-relaxed">{strategy.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
          <div className="p-5 rounded-xl bg-gradient-to-br from-card/30 to-card/60 border border-white/5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-3 font-medium">Goal</p>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Target className="h-5 w-5 text-amber-400" />
              </div>
              <p className="font-bold text-base capitalize">{strategy.expectedEngagement || 'Not specified'}</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-card/30 to-card/60 border border-white/5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-3 font-medium">Timeline</p>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Calendar className="h-5 w-5 text-green-400" />
              </div>
              <p className="font-bold text-base">{strategy.timeline || 'Not specified'}</p>
            </div>
          </div>

          <div className="col-span-2 p-5 rounded-xl bg-gradient-to-br from-card/30 to-card/60 border border-white/5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-3 font-medium">Target Audience</p>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <p className="font-bold text-base">{strategy.targetAudience || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};