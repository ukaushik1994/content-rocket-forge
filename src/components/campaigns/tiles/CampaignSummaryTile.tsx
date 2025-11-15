import { CampaignStrategy, CampaignStatus } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Clock, Users, Zap } from 'lucide-react';
import { CampaignStatusBadge } from '../CampaignStatusBadge';

interface CampaignSummaryTileProps {
  strategy: CampaignStrategy;
  status?: CampaignStatus;
}

export const CampaignSummaryTile = ({ strategy, status = 'planned' }: CampaignSummaryTileProps) => {
  const calculateIntensity = () => {
    const totalPieces = strategy.contentMix.reduce((sum, item) => sum + item.count, 0);
    if (totalPieces >= 20) return 'High';
    if (totalPieces >= 10) return 'Medium';
    return 'Low';
  };

  return (
    <GlassCard className="p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-6 w-6 text-neon-purple" />
            <h2 className="text-2xl font-bold">{strategy.title}</h2>
            <CampaignStatusBadge status={status} />
          </div>
          <p className="text-muted-foreground mb-4">{strategy.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40">
              <TrendingUp className="h-5 w-5 text-neon-purple shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Estimated Reach</p>
                <p className="text-sm font-semibold">{strategy.estimatedReach || 'TBD'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40">
              <Clock className="h-5 w-5 text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-semibold">{strategy.timeline || 'TBD'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40">
              <Users className="h-5 w-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="text-sm font-semibold">{strategy.targetAudience || 'General'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40">
              <Zap className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Intensity</p>
                <Badge variant={calculateIntensity() === 'High' ? 'default' : 'secondary'}>
                  {calculateIntensity()}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
