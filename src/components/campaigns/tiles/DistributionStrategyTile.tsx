import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Share2, Calendar, Clock } from 'lucide-react';

interface DistributionStrategyTileProps {
  strategy: CampaignStrategy;
}

export const DistributionStrategyTile = ({ strategy }: DistributionStrategyTileProps) => {
  const distributionStrategy = strategy.distributionStrategy;

  if (!distributionStrategy) {
    return (
      <GlassCard className="p-8 bg-gradient-to-br from-background/40 via-background/60 to-background/40 backdrop-blur-2xl border-2 border-transparent bg-gradient-to-br before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-cyan-500/20 before:via-transparent before:to-blue-500/20 before:-z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-full bg-cyan-500/10">
            <Share2 className="h-5 w-5 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Distribution Plan</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground/70">
          <p>Distribution plan will be generated...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8 bg-gradient-to-br from-background/40 via-background/60 to-background/40 backdrop-blur-2xl border-2 border-transparent bg-gradient-to-br before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-cyan-500/20 before:via-transparent before:to-blue-500/20 before:-z-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-full bg-cyan-500/10">
          <Share2 className="h-5 w-5 text-cyan-400" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight">Distribution Plan</h3>
      </div>
      
      <div className="space-y-5">
        {distributionStrategy.channels && distributionStrategy.channels.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-3 font-medium">Channels</p>
            <div className="flex gap-2.5 flex-wrap">
              {distributionStrategy.channels.map((channel) => (
                <Badge key={channel} className="bg-gradient-to-r from-cyan-500/20 to-cyan-500/30 text-cyan-300 font-bold px-3 py-1.5">
                  {channel}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {distributionStrategy.postingCadence && (
          <div className="flex items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-card/30 to-card/60 border border-white/5">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Calendar className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">Posting Cadence</p>
              <p className="text-base font-bold">
                {typeof distributionStrategy.postingCadence === 'string' 
                  ? distributionStrategy.postingCadence 
                  : 'Varies by format'}
              </p>
            </div>
          </div>
        )}
        
        {distributionStrategy.bestDaysAndTimes && distributionStrategy.bestDaysAndTimes.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-3 font-medium">Best Days/Times</p>
            <div className="flex gap-2.5 flex-wrap">
              {distributionStrategy.bestDaysAndTimes.map((time) => (
                <Badge key={time} variant="outline" className="text-xs font-bold px-3 py-1.5">
                  <Clock className="h-3 w-3 mr-1.5" />
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-5 border-t border-white/5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2 font-medium">Estimated Traffic Lift</p>
          <p className="text-3xl font-black text-cyan-400">{distributionStrategy.estimatedTrafficLift}</p>
        </div>
      </div>
    </GlassCard>
  );
};