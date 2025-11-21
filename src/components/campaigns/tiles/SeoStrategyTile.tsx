import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Search } from 'lucide-react';

interface SeoStrategyTileProps {
  strategy: CampaignStrategy;
}

export const SeoStrategyTile = ({ strategy }: SeoStrategyTileProps) => {
  const seoIntelligence = strategy.seoIntelligence;

  if (!seoIntelligence) {
    return (
      <GlassCard className="p-6 bg-background/60 backdrop-blur-xl border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-full bg-blue-500/10">
            <Search className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">SEO Strategy</h3>
        </div>
        <p className="text-sm text-muted-foreground">Generating SEO insights...</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 bg-background/60 backdrop-blur-xl border border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-full bg-blue-500/10">
          <Search className="h-5 w-5 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">SEO Strategy</h3>
      </div>
      
      <div className="space-y-5">
        {/* Primary Keyword */}
        {seoIntelligence.primaryKeyword && (
          <div className="p-4 rounded-xl bg-card/40 border border-white/5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Primary Keyword</p>
            <Badge variant="outline" className="font-bold px-3 py-1.5 text-sm">
              {seoIntelligence.primaryKeyword}
            </Badge>
          </div>
        )}
        
        {/* Secondary Keywords */}
        {seoIntelligence.secondaryKeywords && seoIntelligence.secondaryKeywords.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">Secondary Keywords</p>
            <div className="flex flex-wrap gap-2">
              {seoIntelligence.secondaryKeywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="font-medium px-3 py-1.5">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* SEO Impact */}
        {seoIntelligence.expectedSeoImpact && (
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Expected Impact</p>
            </div>
            <p className="text-sm font-medium leading-relaxed">{seoIntelligence.expectedSeoImpact}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
