import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <GlassCard className="p-8 bg-gradient-to-br from-background/40 via-background/60 to-background/40 backdrop-blur-2xl border-2 border-transparent bg-gradient-to-br before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-blue-500/20 before:via-transparent before:to-green-500/20 before:-z-10">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Audience Intelligence */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-full bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Audience Intelligence</h3>
          </div>
          
          {audienceIntelligence ? (
            <div className="space-y-5">
              {audienceIntelligence.personas && audienceIntelligence.personas.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-3 font-medium">Buyer Personas</p>
                  <div className="flex gap-2.5 flex-wrap">
                    {audienceIntelligence.personas.map((persona) => (
                      <Badge key={persona} className="font-bold px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-blue-500/30 text-blue-300">{persona}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {audienceIntelligence.painPoints && audienceIntelligence.painPoints.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-3 font-medium">Pain Points</p>
                  <ul className="space-y-2.5">
                    {audienceIntelligence.painPoints.slice(0, 3).map((pain) => (
                      <li key={pain} className="text-sm flex items-start gap-3 leading-relaxed">
                        <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                        {pain}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {audienceIntelligence.messagingAngle && (
                <div className="pt-5 border-t border-white/5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2 font-medium">Messaging Angle</p>
                  <p className="text-base font-bold text-blue-300 leading-relaxed">{audienceIntelligence.messagingAngle}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/70">Audience insights will be generated...</p>
          )}
        </div>

        {/* SEO Intelligence - Right Column */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-full bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">SEO Strategy</h3>
          </div>
          
          {seoIntelligence ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-3 font-medium">Primary Keyword</p>
                <Badge className="bg-gradient-to-r from-green-500/20 to-green-500/30 text-green-300 font-bold px-3 py-1.5 text-sm">
                  {seoIntelligence.primaryKeyword}
                </Badge>
              </div>
              
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-3 font-medium">Secondary Keywords</p>
                <div className="flex gap-2 flex-wrap">
                  {seoIntelligence.secondaryKeywords.slice(0, 4).map((keyword) => (
                    <Badge key={keyword} variant="outline" className="text-xs font-bold px-3 py-1">{keyword}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-card/30 to-card/60 border border-white/5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">Ranking Difficulty</p>
                <Badge className={cn(difficultyColors[seoIntelligence.avgRankingDifficulty], "font-bold px-3 py-1.5")}>
                  {seoIntelligence.avgRankingDifficulty}
                </Badge>
              </div>
              
              <div className="pt-5 border-t border-white/5">
                <p className="text-base font-bold text-green-300 leading-relaxed">
                  Expected Impact: {seoIntelligence.expectedSeoImpact}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/70">SEO insights will be generated...</p>
          )}
        </div>
      </div>
    </GlassCard>
  );
};