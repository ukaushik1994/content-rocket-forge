import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Share2, Calendar } from 'lucide-react';
import { getPlatformConfig } from '@/utils/platformIcons';
import { cn } from '@/lib/utils';

interface DistributionStrategyTileProps {
  strategy: CampaignStrategy;
}

// Platform color map
const platformColors: Record<string, string> = {
  'linkedin': 'bg-blue-600/10 text-blue-700 hover:bg-blue-600/20',
  'twitter': 'bg-sky-500/10 text-sky-600 hover:bg-sky-500/20',
  'email': 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
  'blog': 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20',
  'facebook': 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
  'instagram': 'bg-pink-500/10 text-pink-600 hover:bg-pink-500/20',
  'youtube': 'bg-red-500/10 text-red-600 hover:bg-red-500/20',
  'website': 'bg-green-500/10 text-green-600 hover:bg-green-500/20',
};

const getPlatformColor = (channel: string) => {
  const key = Object.keys(platformColors).find(k => channel.toLowerCase().includes(k));
  return platformColors[key || ''] || 'bg-muted text-muted-foreground hover:bg-muted/80';
};

export const DistributionStrategyTile = ({ strategy }: DistributionStrategyTileProps) => {
  const distributionStrategy = strategy.distributionStrategy;

  if (!distributionStrategy) {
    return (
      <GlassCard className="p-5 h-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <Share2 className="h-4 w-4 text-rose-600" />
          </div>
          <h3 className="font-semibold">Distribution</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-3">Distribution plan will be generated...</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5 h-full">
      <div className="flex flex-col gap-3 min-w-0">
        {/* Row 1: Header with Icon */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <Share2 className="h-4 w-4 text-rose-600" />
          </div>
          <h3 className="font-semibold">Distribution</h3>
        </div>
        
        {/* Row 2: Channel Badges */}
        {distributionStrategy.channels && distributionStrategy.channels.length > 0 && (
          <div className="flex flex-wrap gap-2 min-w-0">
            {distributionStrategy.channels.map((channel) => {
              const channelId = channel.toLowerCase().replace(/\s+/g, '-');
              const config = getPlatformConfig(channelId);
              const IconComponent = config.icon;
              const colorClass = getPlatformColor(channel);
              
              return (
                <div 
                  key={channel} 
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-default",
                    colorClass
                  )}
                >
                  {IconComponent && <IconComponent className="h-3.5 w-3.5 shrink-0" />}
                  <span className="text-xs font-medium truncate max-w-[100px]">{channel}</span>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Row 3: Posting Cadence */}
        {distributionStrategy.postingCadence && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground min-w-0">
            <Calendar className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-medium line-clamp-2">
              {typeof distributionStrategy.postingCadence === 'string' 
                ? distributionStrategy.postingCadence 
                : 'Varies'}
            </span>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
