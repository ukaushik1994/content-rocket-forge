import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CampaignStrategy } from '@/types/campaign-types';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { contentFormats } from '@/components/content-repurposing/formats';
import { motion } from 'framer-motion';
import { Edit, RefreshCw, Sparkles, Package, ChevronDown, CheckCircle2, Star, Shield, Users, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StrategyTilesProps {
  strategies: CampaignStrategy[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit?: (strategy: CampaignStrategy) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
  solution?: EnhancedSolution | null;
}

export function StrategyTiles({
  strategies,
  selectedId,
  onSelect,
  onEdit,
  onRegenerate,
  isRegenerating = false,
  solution,
}: StrategyTilesProps) {
  const [expandedSolutions, setExpandedSolutions] = useState<string[]>([]);
  
  const toggleExpandSolution = (strategyId: string) => {
    setExpandedSolutions(prev => 
      prev.includes(strategyId) 
        ? prev.filter(id => id !== strategyId)
        : [...prev, strategyId]
    );
  };

  const getFormatName = (formatId: string) => {
    const format = contentFormats.find((f) => f.id === formatId);
    if (!format) {
      return formatId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return format.name;
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategies.map((strategy, index) => {
          const isSelected = selectedId === strategy.id;
          const isSolutionExpanded = expandedSolutions.includes(strategy.id);

          return (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative group",
                isSelected && "ring-2 ring-primary ring-offset-2 shadow-xl shadow-primary/20"
              )}
            >
              <GlassCard className="p-4 space-y-3 bg-background/60 backdrop-blur-xl hover:bg-background/80 transition-all duration-300">
                
                {/* Header with Score */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {strategy.strategyScore && (
                      <Badge className="bg-gradient-to-r from-primary to-blue-500 text-primary-foreground text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {strategy.strategyScore}
                      </Badge>
                    )}
                  </div>
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(strategy);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h4 className="text-lg font-bold leading-tight bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                    {strategy.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {strategy.description}
                  </p>
                </div>

                {/* Collapsible Solution Context */}
                {solution && (
                  <Collapsible
                    open={isSolutionExpanded}
                    onOpenChange={() => toggleExpandSolution(strategy.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between p-2 h-auto hover:bg-primary/5"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-medium">{solution.name}</span>
                        </div>
                        <ChevronDown className={cn("w-3 h-3 transition-transform", isSolutionExpanded && "rotate-180")} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2">
                      {solution.uniqueValuePropositions && solution.uniqueValuePropositions.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs font-medium">Value Props</span>
                          </div>
                          {solution.uniqueValuePropositions.slice(0, 3).map((uvp, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground pl-4">
                              <CheckCircle2 className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{uvp}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {solution.keyDifferentiators && solution.keyDifferentiators.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Shield className="w-3 h-3 text-purple-500" />
                            <span className="text-xs font-medium">Differentiators</span>
                          </div>
                          {solution.keyDifferentiators.slice(0, 3).map((diff, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground pl-4">
                              <Star className="w-3 h-3 text-purple-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{diff}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Compact Content Mix */}
                {strategy.contentMix && strategy.contentMix.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {strategy.contentMix.map((item, i) => (
                      <span key={item.formatId}>
                        {item.count} {getFormatName(item.formatId)}
                        {i < strategy.contentMix.length - 1 ? ' • ' : ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Compact Info Row */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {strategy.timeline && (
                    <Badge variant="secondary" className="text-xs">{strategy.timeline}</Badge>
                  )}
                  {strategy.targetAudience && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span className="line-clamp-1">{strategy.targetAudience}</span>
                    </span>
                  )}
                </div>

                {/* Estimated Reach */}
                {strategy.estimatedReach && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Target className="w-3 h-3 text-green-500" />
                    <span>{strategy.estimatedReach}</span>
                  </div>
                )}

                {/* Select Button */}
                <Button
                  onClick={() => onSelect(strategy.id)}
                  size="sm"
                  className={cn(
                    "w-full transition-all duration-300",
                    isSelected
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary/50 text-foreground hover:bg-secondary"
                  )}
                >
                  {isSelected ? "Selected ✓" : "Select Strategy"}
                </Button>

              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
