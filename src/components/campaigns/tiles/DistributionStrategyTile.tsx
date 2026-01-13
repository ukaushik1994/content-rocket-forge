import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Share2, Calendar } from 'lucide-react';
import { getPlatformConfig } from '@/utils/platformIcons';

interface DistributionStrategyTileProps {
  strategy: CampaignStrategy;
}

export const DistributionStrategyTile = ({ strategy }: DistributionStrategyTileProps) => {
  const distributionStrategy = strategy.distributionStrategy;

  if (!distributionStrategy) {
    return (
      <GlassCard className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <Share2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Distribution Plan</h3>
        </div>
        <p className="text-sm text-muted-foreground">Distribution plan will be generated...</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Share2 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Distribution Plan</h3>
      </div>
      
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Channels */}
        {distributionStrategy.channels && distributionStrategy.channels.length > 0 && (
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Channels</p>
            <div className="flex gap-3 flex-wrap">
              {distributionStrategy.channels.map((channel) => {
                const channelId = channel.toLowerCase().replace(/\s+/g, '-');
                const config = getPlatformConfig(channelId);
                const IconComponent = config.icon;
                
                return (
                  <div 
                    key={channel} 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-medium">{channel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Posting Cadence */}
        {distributionStrategy.postingCadence && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/30 border border-border/50">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Cadence</p>
              <p className="text-sm font-medium">
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
