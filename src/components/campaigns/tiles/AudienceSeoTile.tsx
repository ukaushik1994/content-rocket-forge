import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Users, Search, AlertCircle } from 'lucide-react';

interface AudienceSeoTileProps {
  strategy: CampaignStrategy;
}

const difficultyColors = {
  low: 'bg-green-500/20 text-green-400 border-green-400/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-400/30',
  high: 'bg-red-500/20 text-red-400 border-red-400/30',
};

export const AudienceSeoTile = ({ strategy }: AudienceSeoTileProps) => {
  const audienceIntelligence = strategy.audienceIntelligence;
  const seoIntelligence = strategy.seoIntelligence;

  return (
    <GlassCard className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience Intelligence - Left Column */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold">Audience Intelligence</h3>
          </div>
          
          {audienceIntelligence ? (
            <div className="space-y-3">
              {audienceIntelligence.personas && audienceIntelligence.personas.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Buyer Personas</p>
                  <div className="flex gap-2 flex-wrap">
                    {audienceIntelligence.personas.map((persona) => (
                      <Badge key={persona} variant="secondary">{persona}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {audienceIntelligence.painPoints && audienceIntelligence.painPoints.length > 0 && (
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
                <div className="pt-3 border-t border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Messaging Angle</p>
                  <p className="text-sm font-medium text-purple-300">{audienceIntelligence.messagingAngle}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Audience insights will be generated...</p>
          )}
        </div>

        {/* SEO Intelligence - Right Column */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold">SEO Strategy</h3>
          </div>
          
          {seoIntelligence ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Primary Keyword</p>
                <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                  {seoIntelligence.primaryKeyword}
                </Badge>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">Secondary Keywords</p>
                <div className="flex gap-1.5 flex-wrap">
                  {seoIntelligence.secondaryKeywords.slice(0, 4).map((keyword) => (
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
              
              <div className="pt-3 border-t border-border/30">
                <p className="text-sm font-medium text-green-300">
                  Expected Impact: {seoIntelligence.expectedSeoImpact}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">SEO insights will be generated...</p>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
