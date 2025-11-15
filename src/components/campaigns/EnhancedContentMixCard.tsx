import React from 'react';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { ContentFormatCount } from '@/types/campaign-types';
import { getFormatIconComponent, getFormatByIdOrDefault } from '@/components/content-repurposing/formats';
import { Clock, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';

interface EnhancedContentMixCardProps {
  format: ContentFormatCount;
}

export function EnhancedContentMixCard({ format }: EnhancedContentMixCardProps) {
  const formatInfo = getFormatByIdOrDefault(format.formatId);
  const Icon = getFormatIconComponent(format.formatId);

  const seoPotentialColors = {
    high: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    low: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <GlassCard className="p-3 space-y-2 bg-card/60 hover:bg-card/80 transition-all duration-300 border-border/60">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm truncate text-foreground">{formatInfo.name}</h4>
            <Badge variant="secondary" className="text-xs shrink-0 bg-primary/10 font-semibold">
              {format.count}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{formatInfo.description}</p>
        </div>
      </div>

      <div className="space-y-1.5 pl-11">
        {format.frequency && (
          <div className="flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-muted-foreground">{format.frequency}</span>
          </div>
        )}

        {format.bestTimes && format.bestTimes.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-muted-foreground">Best: {format.bestTimes.join(', ')}</span>
          </div>
        )}

        {format.estimatedEffort && (
          <div className="flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-muted-foreground">{format.estimatedEffort}</span>
          </div>
        )}

        {format.seoPotential && (
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" />
            <Badge 
              variant="outline" 
              className={`text-xs font-semibold ${seoPotentialColors[format.seoPotential]}`}
            >
              SEO: {format.seoPotential.toUpperCase()}
            </Badge>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
