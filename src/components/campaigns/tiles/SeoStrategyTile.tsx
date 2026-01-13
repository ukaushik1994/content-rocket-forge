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
      <div className="flex flex-col gap-3 min-w-0">
        {/* Row 1: Header with Icon, Label, Primary Keyword, Impact */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Search className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="font-semibold">SEO</h3>
          </div>
          
          {/* Primary Keyword */}
          {seoIntelligence.primaryKeyword && (
            <Badge className="bg-indigo-500/10 text-indigo-700 border-indigo-500/20 hover:bg-indigo-500/20 max-w-[200px] truncate shrink-0">
              <Hash className="h-3 w-3 mr-1 shrink-0" />
              <span className="truncate">{seoIntelligence.primaryKeyword}</span>
            </Badge>
          )}
          
          {/* SEO Impact */}
          {seoIntelligence.expectedSeoImpact && (
            <div className="flex items-center gap-1.5 text-sm text-green-600 shrink-0 ml-auto">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">High Impact</span>
            </div>
          )}
        </div>
        
        {/* Row 2: Secondary Keywords */}
        {seoIntelligence.secondaryKeywords && seoIntelligence.secondaryKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {seoIntelligence.secondaryKeywords.slice(0, 4).map((keyword, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="font-normal text-xs max-w-[180px] truncate"
              >
                <span className="truncate">{keyword}</span>
              </Badge>
            ))}
            {seoIntelligence.secondaryKeywords.length > 4 && (
              <Badge variant="outline" className="font-normal text-xs text-muted-foreground shrink-0">
                +{seoIntelligence.secondaryKeywords.length - 4}
              </Badge>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
};
