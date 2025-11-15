import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { CampaignStrategy } from '@/types/campaign-types';
import { contentFormats } from '@/components/content-repurposing/formats';
import { motion } from 'framer-motion';
import { Check, Edit, RefreshCw, TrendingUp, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StrategyTilesProps {
  strategies: CampaignStrategy[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit?: (strategy: CampaignStrategy) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

export function StrategyTiles({
  strategies,
  selectedId,
  onSelect,
  onEdit,
  onRegenerate,
  isRegenerating = false,
}: StrategyTilesProps) {
  const getFormatIcon = (formatId: string) => {
    const format = contentFormats.find((f) => f.id === formatId);
    return format?.icon;
  };

  const getFormatName = (formatId: string) => {
    const format = contentFormats.find((f) => f.id === formatId);
    return format?.name || formatId;
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Choose Your Strategy</h3>
          <p className="text-sm text-muted-foreground">
            Select the approach that best fits your goals
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isRegenerating}
        >
          {isRegenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate All
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {strategies.map((strategy, index) => {
          const isSelected = selectedId === strategy.id;
          const Icon = getFormatIcon(strategy.contentMix[0]?.formatId);

          return (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard
                className={cn(
                  'p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02]',
                  'relative overflow-hidden group',
                  isSelected && 'ring-2 ring-primary shadow-lg shadow-primary/20'
                )}
                onClick={() => onSelect(strategy.id)}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </motion.div>
                )}

                {/* Edit button */}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-16 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(strategy);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}

                <div className="space-y-4">
                  {/* Header */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold leading-tight">
                      {strategy.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {strategy.description}
                    </p>
                  </div>

                  {/* Content Mix */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Content Mix
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {strategy.contentMix.slice(0, 4).map((item) => {
                        const FormatIcon = getFormatIcon(item.formatId);
                        return (
                          <div
                            key={item.formatId}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 backdrop-blur-sm"
                          >
                            {FormatIcon && (
                              <FormatIcon className="h-4 w-4 text-primary" />
                            )}
                            <span className="text-sm font-medium">{item.count}</span>
                            <span className="text-xs text-muted-foreground truncate">
                              {getFormatName(item.formatId)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {strategy.contentMix.length > 4 && (
                      <p className="text-xs text-muted-foreground">
                        + {strategy.contentMix.length - 4} more formats
                      </p>
                    )}
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {strategy.estimatedReach && (
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        {strategy.estimatedReach}
                      </Badge>
                    )}
                    {strategy.timeline && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        {strategy.timeline}
                      </Badge>
                    )}
                    {strategy.targetAudience && (
                      <Badge variant="secondary" className="text-xs">
                        <Users className="mr-1 h-3 w-3" />
                        {strategy.targetAudience}
                      </Badge>
                    )}
                  </div>

                  {/* Select button */}
                  <Button
                    variant={isSelected ? 'default' : 'outline'}
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(strategy.id);
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select This Strategy'}
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
