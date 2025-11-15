import React from 'react';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { ContentFormatCount } from '@/types/campaign-types';
import { getFormatIconComponent, getFormatByIdOrDefault } from '@/components/content-repurposing/formats';
import { Clock, TrendingUp, Zap } from 'lucide-react';

interface EnhancedContentMixCardProps {
  format: ContentFormatCount;
}

export function EnhancedContentMixCard({ format }: EnhancedContentMixCardProps) {
  const formatInfo = getFormatByIdOrDefault(format.formatId);
  const Icon = getFormatIconComponent(format.formatId);

  const seoPotentialColors = {
    high: 'bg-green-500/10 text-green-600 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    low: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };

  return (
    <GlassCard className="p-3 space-y-2 bg-background/40 hover:bg-background/60 transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm truncate">{formatInfo.name}</h4>
            <Badge variant="secondary" className="text-xs shrink-0">
              {format.count} {format.count === 1 ? 'piece' : 'pieces'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{formatInfo.description}</p>
        </div>
      </div>

      <div className="space-y-1.5 pl-11">
        {format.frequency && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Schedule: {format.frequency}</span>
          </div>
        )}

        {format.bestTimes && format.bestTimes.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="w-3 h-3" />
            <span>Best times: {format.bestTimes.join(', ')}</span>
          </div>
        )}

        {format.estimatedEffort && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Effort: {format.estimatedEffort}</span>
          </div>
        )}

        {format.seoPotential && (
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" />
            <Badge 
              variant="outline" 
              className={`text-xs ${seoPotentialColors[format.seoPotential]}`}
            >
              SEO: {format.seoPotential}
            </Badge>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
