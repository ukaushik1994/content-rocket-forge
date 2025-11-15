import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CampaignStrategy } from '@/types/campaign-types';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { contentFormats } from '@/components/content-repurposing/formats';
import { EnhancedContentMixCard } from './EnhancedContentMixCard';
import { ContentBriefCard } from './ContentBriefCard';
import { motion } from 'framer-motion';
import { Edit, RefreshCw, Sparkles, Package, ChevronDown, CheckCircle2, Star, Shield, Users, Target, FileText, Eye } from 'lucide-react';
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
          variant="default"
          size="default"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg"
        >
          {isRegenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Generate New Strategies
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
              className="relative group"
            >
              <GlassCard 
                className={cn(
                  "p-4 space-y-4 transition-all duration-300 cursor-pointer",
                  isSelected 
                    ? "bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-blue-500/20 border-blue-400/50 shadow-xl shadow-blue-500/20"
                    : "bg-background/40 border-border/50 hover:bg-background/60 hover:border-border/80"
                )}
                onClick={() => onSelect(strategy.id)}
              >
                
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
                  </div>
                )}
                
                {/* Header with Score and Edit */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {strategy.strategyScore && (
                        <Badge className="bg-gradient-to-r from-primary to-blue-500 text-primary-foreground text-xs font-semibold">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Score: {strategy.strategyScore}
                        </Badge>
                      )}
                      {strategy.expectedEngagement && (
                        <Badge variant="outline" className="text-xs border-border/50 bg-background/20">
                          {strategy.expectedEngagement} engagement
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold leading-tight line-clamp-2 text-foreground">
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-400 inline mr-1" />}
                      {strategy.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {strategy.description}
                    </p>
                  </div>
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0 bg-background/20 border-border/50 hover:bg-background/40"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(strategy);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                
                {/* Key Metrics Section */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-border/30">
                  <Target className="h-5 w-5 text-green-400 shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground/80">Campaign Scope</div>
                    <div className="text-2xl font-bold text-foreground">
                      {strategy.contentMix.reduce((sum, format) => sum + format.count, 0)} pieces
                    </div>
                  </div>
                  {strategy.estimatedReach && (
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Est. Reach</div>
                      <div className="text-sm font-semibold text-foreground">{strategy.estimatedReach}</div>
                    </div>
                  )}
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

                {/* Content Mix */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <h5 className="text-sm font-semibold text-foreground/80">Content Mix</h5>
                  </div>
                  <div className="space-y-2">
                    {strategy.contentMix.map((format, idx) => (
                      <EnhancedContentMixCard key={idx} format={format} />
                    ))}
                  </div>
                </div>

                {/* Collapsible Sections */}
                <div className="space-y-2">
                  
                  {/* Specific Content Topics & SEO Briefs */}
                  {strategy.contentMix.some(format => format.specificTopics && format.specificTopics.length > 0) && (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between p-2 h-auto hover:bg-accent/50"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-medium">SEO Content Briefs ({
                              strategy.contentMix.reduce((sum, f) => sum + (f.specificTopics?.length || 0), 0)
                            })</span>
                          </div>
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 pt-2 max-h-[400px] overflow-y-auto">
                        {strategy.contentMix.map((format, idx) => 
                          format.specificTopics?.map((topic, topicIdx) => (
                            <ContentBriefCard 
                              key={`${idx}-${topicIdx}`} 
                              brief={topic}
                              formatName={getFormatName(format.formatId)}
                            />
                          ))
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Target Audience & Timeline */}
                  {(strategy.targetAudience || strategy.timeline) && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-2">
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
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-border/30">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(strategy.id);
                    }}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "gap-2 flex-1",
                      isSelected 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/30'
                        : 'bg-background/20 border-border/50 hover:bg-background/40'
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isSelected ? 'Selected' : 'Select Strategy'}
                  </Button>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      // View full details action
                    }}
                    size="sm"
                    variant="outline"
                    className="bg-background/20 border-border/50 hover:bg-background/40 w-10 h-9 p-0"
                    title="View Full Details"
                  >
                    <FileText className="h-4 w-4" />
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
