import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Share2, Calendar } from 'lucide-react';

interface DistributionStrategyTileProps {
  strategy: CampaignStrategy;
}

export const DistributionStrategyTile = ({ strategy }: DistributionStrategyTileProps) => {
  const distributionStrategy = strategy.distributionStrategy;

  if (!distributionStrategy) {
    return (
      <GlassCard className="p-6 bg-background/60 backdrop-blur-xl border border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-full bg-purple-500/10">
            <Share2 className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Distribution Plan</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Distribution plan will be generated...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 bg-background/60 backdrop-blur-xl border border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-full bg-purple-500/10">
          <Share2 className="h-5 w-5 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Distribution Plan</h3>
      </div>
      
      <div className="space-y-4">
        {distributionStrategy.channels && distributionStrategy.channels.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">Channels</p>
            <div className="flex gap-2 flex-wrap">
              {distributionStrategy.channels.map((channel) => (
                <Badge key={channel} variant="outline" className="font-medium px-3 py-1.5">
                  {channel}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {distributionStrategy.postingCadence && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card/40 border border-white/5">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Calendar className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Posting Cadence</p>
              <p className="text-sm font-bold">
                {typeof distributionStrategy.postingCadence === 'string' 
                  ? distributionStrategy.postingCadence 
                  : 'Varies by format'}
              </p>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};