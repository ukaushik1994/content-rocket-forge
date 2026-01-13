import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Briefcase, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TargetAudienceMessagingTileProps {
  strategy: CampaignStrategy;
}

export const TargetAudienceMessagingTile = ({ strategy }: TargetAudienceMessagingTileProps) => {
  const audienceIntelligence = strategy.audienceIntelligence;

  if (!audienceIntelligence) {
    return (
      <GlassCard className="p-6 h-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-green-600" />
          </div>
          <h3 className="font-semibold">Audience & Messaging</h3>
        </div>
        <p className="text-sm text-muted-foreground">Generating insights...</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
          <Users className="h-4 w-4 text-green-600" />
        </div>
        <h3 className="font-semibold">Audience & Messaging</h3>
      </div>
      
      <div className="space-y-5 flex-1">
        {/* Primary Messaging Hook - Quote Style */}
        {audienceIntelligence.messagingAngle && (
          <div className="relative pl-4 py-3 border-l-2 border-primary/50 bg-muted/20 rounded-r-lg">
            <MessageSquare className="absolute -left-3 top-3 h-5 w-5 text-primary bg-background p-0.5 rounded" />
            <p className="text-sm font-medium leading-relaxed italic">
              "{audienceIntelligence.messagingAngle}"
            </p>
          </div>
        )}
        
        {/* Personas - Avatar Style */}
        {audienceIntelligence.personas && audienceIntelligence.personas.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Users className="h-3 w-3" /> Personas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {audienceIntelligence.personas.map((persona, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-green-500/10 text-green-700 border-0 font-normal"
                >
                  {persona}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Industry Segments - Icon Badges */}
        {audienceIntelligence.industrySegments && audienceIntelligence.industrySegments.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Briefcase className="h-3 w-3" /> Industries
            </p>
            <div className="flex flex-wrap gap-1.5">
              {audienceIntelligence.industrySegments.map((industry, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="font-normal"
                >
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Pain Points - Checklist Style */}
        {audienceIntelligence.painPoints && audienceIntelligence.painPoints.length > 0 && (
          <div className="pt-3 border-t border-border/40">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3" /> Pain Points
            </p>
            <div className="space-y-1.5">
              {audienceIntelligence.painPoints.slice(0, 3).map((painPoint, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <p className="leading-relaxed text-muted-foreground">{painPoint}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
