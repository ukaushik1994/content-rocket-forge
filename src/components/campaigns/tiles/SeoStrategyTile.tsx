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
      <GlassCard className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <Search className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">SEO Strategy</h3>
        </div>
        <p className="text-sm text-muted-foreground">Generating SEO insights...</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Search className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">SEO Strategy</h3>
      </div>
      
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Primary Keyword */}
        {seoIntelligence.primaryKeyword && (
          <div className="flex-shrink-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Primary Keyword</p>
            <Badge variant="default" className="text-sm px-4 py-1.5">
              {seoIntelligence.primaryKeyword}
            </Badge>
          </div>
        )}
        
        {/* Secondary Keywords */}
        {seoIntelligence.secondaryKeywords && seoIntelligence.secondaryKeywords.length > 0 && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Secondary Keywords</p>
            <div className="flex flex-wrap gap-2">
              {seoIntelligence.secondaryKeywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="font-normal">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* SEO Impact */}
        {seoIntelligence.expectedSeoImpact && (
          <div className="flex-shrink-0 lg:max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Expected Impact</p>
            </div>
            <p className="text-sm leading-relaxed">{seoIntelligence.expectedSeoImpact}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
