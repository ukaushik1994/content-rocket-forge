import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp } from 'lucide-react';

interface AudienceSeoTileProps {
  strategy: CampaignStrategy;
}

export const AudienceSeoTile = ({ strategy }: AudienceSeoTileProps) => {
  const audienceIntelligence = strategy.audienceIntelligence;
  const seoIntelligence = strategy.seoIntelligence;

  return (
    <GlassCard className="p-6 bg-background/60 backdrop-blur-xl border border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-full bg-blue-500/10">
          <TrendingUp className="h-5 w-5 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Strategy Insights</h3>
      </div>
      
      <div className="space-y-5">
        {/* Primary Keyword */}
        {seoIntelligence?.primaryKeyword && (
          <div className="p-4 rounded-xl bg-card/40 border border-white/5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Primary Keyword</p>
            <Badge variant="outline" className="font-bold px-3 py-1.5 text-sm">
              {seoIntelligence.primaryKeyword}
            </Badge>
          </div>
        )}
        
        {/* Target Audience Count */}
        {audienceIntelligence?.personas && audienceIntelligence.personas.length > 0 && (
          <div className="p-4 rounded-xl bg-card/40 border border-white/5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Target Personas</p>
                <p className="text-base font-bold">{audienceIntelligence.personas.length} personas identified</p>
              </div>
            </div>
          </div>
        )}
        
        {/* SEO Impact */}
        {seoIntelligence?.expectedSeoImpact && (
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Expected Impact</p>
            <p className="text-sm font-medium leading-relaxed">{seoIntelligence.expectedSeoImpact}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
