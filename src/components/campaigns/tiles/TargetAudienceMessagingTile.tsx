import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Target, CheckCircle2 } from 'lucide-react';

interface TargetAudienceMessagingTileProps {
  strategy: CampaignStrategy;
}

export const TargetAudienceMessagingTile = ({ strategy }: TargetAudienceMessagingTileProps) => {
  const audienceIntelligence = strategy.audienceIntelligence;

  if (!audienceIntelligence) {
    return (
      <GlassCard className="p-6 bg-background/60 backdrop-blur-xl border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-full bg-purple-500/10">
            <Users className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Target Audience & Messaging</h3>
        </div>
        <p className="text-sm text-muted-foreground">Generating audience insights...</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 bg-background/60 backdrop-blur-xl border border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-full bg-purple-500/10">
          <Users className="h-5 w-5 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Target Audience & Messaging</h3>
      </div>
      
      <div className="space-y-6">
        {/* Primary Messaging Angle */}
        {audienceIntelligence.messagingAngle && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-2 border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Primary Messaging Hook</p>
            </div>
            <p className="text-base font-semibold text-foreground leading-relaxed">
              {audienceIntelligence.messagingAngle}
            </p>
          </div>
        )}
        
        {/* Target Personas */}
        {audienceIntelligence.personas && audienceIntelligence.personas.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-purple-400" />
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Target Personas</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {audienceIntelligence.personas.map((persona, index) => (
                <Badge key={index} variant="outline" className="font-medium px-3 py-1.5">
                  {persona}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Industry Segments */}
        {audienceIntelligence.industrySegments && audienceIntelligence.industrySegments.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">Industry Segments</p>
            <div className="flex flex-wrap gap-2">
              {audienceIntelligence.industrySegments.map((industry, index) => (
                <Badge key={index} variant="secondary" className="font-medium px-3 py-1.5">
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Pain Points */}
        {audienceIntelligence.painPoints && audienceIntelligence.painPoints.length > 0 && (
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">Pain Points Addressed</p>
            <div className="space-y-2">
              {audienceIntelligence.painPoints.map((painPoint, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium leading-relaxed">{painPoint}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Purchase Motivations */}
        {audienceIntelligence.purchaseMotivations && audienceIntelligence.purchaseMotivations.length > 0 && (
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">Purchase Motivations</p>
            <div className="flex flex-wrap gap-2">
              {audienceIntelligence.purchaseMotivations.map((motivation, index) => (
                <Badge key={index} variant="outline" className="bg-purple-500/5 border-purple-500/20 text-purple-300 font-medium px-3 py-1.5">
                  {motivation}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
