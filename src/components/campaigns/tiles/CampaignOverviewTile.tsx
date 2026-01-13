import { CampaignStrategy, CampaignStatus } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight } from 'lucide-react';

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

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        {/* Solution Logo/Icon */}
        <div className="flex-shrink-0">
          {solution?.logo_url ? (
            <img 
              src={solution.logo_url} 
              alt={solution.name}
              className="h-14 w-14 rounded-xl object-contain border border-border/30"
            />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
          )}
        </div>
        
        {/* Title & Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-semibold truncate">{strategy.title}</h3>
            <Badge variant={config.variant} className="flex-shrink-0">{config.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {campaignObjective || strategy.description || `${totalPieces} content pieces across ${strategy.contentMix.length} formats`}
          </p>
        </div>
        
        {/* Solution Name Badge */}
        {solution && (
          <div className="flex-shrink-0 hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/30">
            <span className="text-xs text-muted-foreground">Promoting</span>
            <span className="text-sm font-medium">{solution.name}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
      </div>
    </GlassCard>
  );
};
