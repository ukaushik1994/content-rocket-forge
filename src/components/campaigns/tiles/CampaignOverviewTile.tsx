import { CampaignStrategy, CampaignStatus } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Calendar, Users, Sparkles, Edit } from 'lucide-react';

interface CampaignOverviewTileProps {
  strategy: CampaignStrategy;
  status: CampaignStatus;
}

const statusConfig = {
  draft: { color: 'bg-gray-500/20 text-gray-400 border-gray-400/30', label: 'Draft' },
  planned: { color: 'bg-blue-500/20 text-blue-400 border-blue-400/30', label: 'Planned' },
  active: { color: 'bg-purple-500/20 text-purple-400 border-purple-400/30', label: 'Active' },
  completed: { color: 'bg-green-500/20 text-green-400 border-green-400/30', label: 'Completed' },
  archived: { color: 'bg-gray-500/20 text-gray-400 border-gray-400/30', label: 'Archived' },
};

export const CampaignOverviewTile = ({ strategy, status }: CampaignOverviewTileProps) => {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <GlassCard className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">{strategy.title}</h2>
          </div>
          <p className="text-muted-foreground">{strategy.description}</p>
        </div>
        <Badge className={config.color}>
          {config.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/40">
          <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Campaign Goal</p>
            <p className="font-medium">{strategy.expectedEngagement || 'Brand Awareness'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/40">
          <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Timeline</p>
            <p className="font-medium">{strategy.timeline || '4 weeks'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/40">
          <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Target Audience</p>
            <p className="font-medium">{strategy.targetAudience || 'B2B Decision Makers'}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
