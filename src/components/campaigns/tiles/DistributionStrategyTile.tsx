import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Calendar, Clock } from 'lucide-react';

interface DistributionStrategyTileProps {
  strategy: CampaignStrategy;
}

export const DistributionStrategyTile = ({ strategy }: DistributionStrategyTileProps) => {
  const distributionStrategy = strategy.distributionStrategy;

  if (!distributionStrategy) {
    return (
      <GlassCard 
        className="p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20"
      >
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold">Distribution Strategy</h3>
        </div>
        <div className="text-center py-4 text-muted-foreground">
          <p>Distribution plan will be generated...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard 
      className="p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold">Distribution Strategy</h3>
      </div>
      
      <div className="space-y-3">
        {distributionStrategy.channels && distributionStrategy.channels.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Channels</p>
            <div className="flex gap-2 flex-wrap">
              {distributionStrategy.channels.map((channel) => (
                <Badge key={channel} className="bg-blue-500/20 text-blue-300">
                  {channel}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {distributionStrategy.postingCadence && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-background/40">
            <Calendar className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">Posting Cadence</p>
              <p className="text-sm font-medium">
                {typeof distributionStrategy.postingCadence === 'string' 
                  ? distributionStrategy.postingCadence 
                  : 'Varies by format'}
              </p>
            </div>
          </div>
        )}
        
        {distributionStrategy.bestDaysAndTimes && distributionStrategy.bestDaysAndTimes.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Best Days/Times</p>
            <div className="flex gap-2 flex-wrap">
              {distributionStrategy.bestDaysAndTimes.map((time) => (
                <Badge key={time} variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-3 border-t border-blue-500/20">
          <p className="text-xs text-muted-foreground mb-1">Estimated Traffic Lift</p>
          <p className="text-lg font-bold text-blue-400">{distributionStrategy.estimatedTrafficLift}</p>
        </div>
      </div>
    </GlassCard>
  );
};
