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
      <GlassCard className="p-8 h-full">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Audience & Messaging</h3>
        </div>
        <p className="text-sm text-muted-foreground">Generating insights...</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Audience & Messaging</h3>
      </div>
      
      <div className="space-y-6">
        {/* Primary Messaging Hook */}
        {audienceIntelligence.messagingAngle && (
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Core Message</p>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              "{audienceIntelligence.messagingAngle}"
            </p>
          </div>
        )}
        
        {/* Target Personas */}
        {audienceIntelligence.personas && audienceIntelligence.personas.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Personas</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {audienceIntelligence.personas.map((persona, index) => (
                <Badge key={index} variant="outline" className="font-normal">
                  {persona}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Industry Segments */}
        {audienceIntelligence.industrySegments && audienceIntelligence.industrySegments.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Industries</p>
            <div className="flex flex-wrap gap-2">
              {audienceIntelligence.industrySegments.map((industry, index) => (
                <Badge key={index} variant="secondary" className="font-normal">
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Pain Points */}
        {audienceIntelligence.painPoints && audienceIntelligence.painPoints.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Pain Points</p>
            <div className="space-y-2">
              {audienceIntelligence.painPoints.map((painPoint, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm leading-relaxed">{painPoint}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Purchase Motivations */}
        {audienceIntelligence.purchaseMotivations && audienceIntelligence.purchaseMotivations.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Motivations</p>
            <div className="flex flex-wrap gap-2">
              {audienceIntelligence.purchaseMotivations.map((motivation, index) => (
                <Badge key={index} variant="outline" className="font-normal text-muted-foreground">
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
