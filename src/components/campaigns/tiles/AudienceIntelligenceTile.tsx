import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Users, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useCampaignFlow } from '@/contexts/CampaignFlowContext';

interface AudienceIntelligenceTileProps {
  strategy: CampaignStrategy;
}

export const AudienceIntelligenceTile = ({ strategy }: AudienceIntelligenceTileProps) => {
  const { openFlowPanel } = useCampaignFlow();
  const audienceIntelligence = strategy.audienceIntelligence;

  if (!audienceIntelligence) {
    return (
      <GlassCard 
        className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 cursor-pointer transition-all duration-200 hover:border-neon-purple/50 hover:scale-[1.02] hover:shadow-lg hover:shadow-neon-purple/20 relative group"
        onClick={() => openFlowPanel('audience', strategy)}
      >
        <ArrowUpRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold">Audience Intelligence</h3>
        </div>
        <div className="text-center py-4 text-muted-foreground">
          <p>Audience insights will be generated...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard 
      className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 cursor-pointer transition-all duration-200 hover:border-neon-purple/50 hover:scale-[1.02] hover:shadow-lg hover:shadow-neon-purple/20 relative group"
      onClick={() => openFlowPanel('audience', strategy)}
    >
      <ArrowUpRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg font-semibold">Audience Intelligence</h3>
      </div>
      
      <div className="space-y-3">
        {audienceIntelligence.personas && Array.isArray(audienceIntelligence.personas) && audienceIntelligence.personas.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Ideal Buyer Personas</p>
            <div className="flex gap-2 flex-wrap">
              {audienceIntelligence.personas.map((persona) => (
                <Badge key={persona} variant="secondary">{persona}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {audienceIntelligence.industrySegments && Array.isArray(audienceIntelligence.industrySegments) && audienceIntelligence.industrySegments.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Industry Segments</p>
            <div className="flex gap-2 flex-wrap">
              {audienceIntelligence.industrySegments.map((industry) => (
                <Badge key={industry}>{industry}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {audienceIntelligence.painPoints && Array.isArray(audienceIntelligence.painPoints) && audienceIntelligence.painPoints.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Pain Points</p>
            <ul className="space-y-1">
              {audienceIntelligence.painPoints.slice(0, 3).map((pain) => (
                <li key={pain} className="text-sm flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                  {pain}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {audienceIntelligence.messagingAngle && (
          <div className="pt-3 border-t border-purple-500/20">
            <p className="text-xs text-muted-foreground mb-1">Messaging Angle</p>
            <p className="text-sm font-medium text-purple-300">{audienceIntelligence.messagingAngle}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
