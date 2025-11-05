import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Newspaper, Activity } from 'lucide-react';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

interface MarketInsightsCardProps {
  data: CompetitorAutoFillPayload;
}

export function MarketInsightsCard({ data }: MarketInsightsCardProps) {
  const hasData = data.recent_developments?.length || data.growth_indicators || data.market_sentiment;

  if (!hasData) return null;

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Market Insights
      </h3>
      <div className="space-y-4">
        {data.growth_indicators && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Growth Indicators
            </p>
            <Badge variant="secondary">{data.growth_indicators}</Badge>
          </div>
        )}

        {data.market_sentiment && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Market Sentiment</p>
            <p className="text-sm">{data.market_sentiment}</p>
          </div>
        )}

        {data.recent_developments && data.recent_developments.length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Newspaper className="w-3 h-3" />
              Recent Developments
            </p>
            <ul className="space-y-2">
              {data.recent_developments.map((dev, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">●</span>
                  <span>{dev}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
