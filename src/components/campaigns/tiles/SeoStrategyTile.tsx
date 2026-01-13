import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Search, Hash } from 'lucide-react';

interface SeoStrategyTileProps {
  strategy: CampaignStrategy;
}

export const SeoStrategyTile = ({ strategy }: SeoStrategyTileProps) => {
  const seoIntelligence = strategy.seoIntelligence;

  if (!seoIntelligence) {
    return (
      <GlassCard className="p-5 h-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Search className="h-4 w-4 text-indigo-600" />
          </div>
          <h3 className="font-semibold">SEO Strategy</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-3">Generating SEO insights...</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Header with Icon */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Search className="h-4 w-4 text-indigo-600" />
          </div>
          <h3 className="font-semibold">SEO</h3>
        </div>
        
        {/* Primary Keyword - Featured Badge */}
        {seoIntelligence.primaryKeyword && (
          <div className="flex items-center gap-2">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge className="bg-indigo-500/10 text-indigo-700 border-indigo-500/20 hover:bg-indigo-500/20">
              {seoIntelligence.primaryKeyword}
            </Badge>
          </div>
        )}
        
        {/* Secondary Keywords - Inline */}
        {seoIntelligence.secondaryKeywords && seoIntelligence.secondaryKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 flex-1">
            {seoIntelligence.secondaryKeywords.slice(0, 4).map((keyword, index) => (
              <Badge key={index} variant="outline" className="font-normal text-xs">
                {keyword}
              </Badge>
            ))}
            {seoIntelligence.secondaryKeywords.length > 4 && (
              <Badge variant="outline" className="font-normal text-xs text-muted-foreground">
                +{seoIntelligence.secondaryKeywords.length - 4}
              </Badge>
            )}
          </div>
        )}
        
        {/* SEO Impact - Compact */}
        {seoIntelligence.expectedSeoImpact && (
          <div className="flex items-center gap-1.5 text-sm text-green-600 flex-shrink-0">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">High Impact</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
