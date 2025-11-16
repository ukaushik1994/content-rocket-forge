import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface SeoIntelligenceTileProps {
  strategy: CampaignStrategy;
}

export const SeoIntelligenceTile = ({ strategy }: SeoIntelligenceTileProps) => {
  const seoIntelligence = strategy.seoIntelligence;

  const difficultyColors = {
    low: 'bg-green-500/20 text-green-400 border-green-400/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-400/30',
    high: 'bg-red-500/20 text-red-400 border-red-400/30',
  };

  if (!seoIntelligence) {
    return (
      <GlassCard 
        className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20"
      >
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-semibold">SEO Intelligence</h3>
        </div>
        <div className="text-center py-4 text-muted-foreground">
          <p>SEO insights will be generated...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard 
      className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-green-400" />
        <h3 className="text-lg font-semibold">SEO Intelligence</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Primary Keyword</p>
          <Badge className="bg-green-500/20 text-green-400 border-green-400/30 text-sm">
            {seoIntelligence.primaryKeyword}
          </Badge>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground mb-1">Secondary Keywords</p>
          <div className="flex gap-1.5 flex-wrap">
            {seoIntelligence.secondaryKeywords.slice(0, 5).map((keyword) => (
              <Badge key={keyword} variant="outline" className="text-xs">{keyword}</Badge>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Ranking Difficulty</p>
          <Badge className={difficultyColors[seoIntelligence.avgRankingDifficulty]}>
            {seoIntelligence.avgRankingDifficulty}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Expected SEO Impact</p>
          <p className="text-sm font-medium text-green-400">{seoIntelligence.expectedSeoImpact}</p>
        </div>
        
        <div className="pt-3 border-t border-green-500/20">
          <p className="text-sm font-medium text-green-300">
            {seoIntelligence.briefTemplatesAvailable} Content Briefs Ready
          </p>
        </div>
      </div>
    </GlassCard>
  );
};
