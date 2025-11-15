import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CampaignStrategy } from '@/types/campaign-types';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { contentFormats } from '@/components/content-repurposing/formats';
import { ContentBriefCard } from './ContentBriefCard';
import { motion } from 'framer-motion';
import { Edit, RefreshCw, Star, Package, ChevronDown, CheckCircle2, Shield, Users, Target, FileText, Eye, TrendingUp, Zap, Clock } from 'lucide-react';
import { getFormatByIdOrDefault, getFormatIconComponent } from '@/components/content-repurposing/formats';
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

      <div className="grid grid-cols-1 gap-6">
        {strategies.map((strategy, index) => {
          const isSelected = selectedId === strategy.id;
          const isSolutionExpanded = expandedSolutions.includes(strategy.id);

          return (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.005, y: -2 }}
              className="relative group h-full"
            >
              <motion.div
                initial={false}
                animate={{
                  borderColor: isSelected ? 'rgba(96, 165, 250, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: isSelected 
                    ? '0 20px 25px -5px rgba(59, 130, 246, 0.2)' 
                    : '0 0 0 0 rgba(0, 0, 0, 0)'
                }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard 
                  className={cn(
                    "p-6 space-y-4 transition-all duration-300 cursor-pointer overflow-hidden relative h-full flex flex-col",
                    "bg-background/60 backdrop-blur-xl",
                    isSelected 
                      ? "bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent border-blue-400/50 shadow-lg shadow-blue-500/20"
                      : "border-border/50 hover:border-primary/30 hover:shadow-lg"
                  )}
                  onClick={() => onSelect(strategy.id)}
                >
                
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-xl border border-blue-400/30">
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
                        <span className="text-xs font-medium text-blue-400">Selected</span>
                      </div>
                    </div>
                  )}
                
                  {/* Header with Score and Edit */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {strategy.strategyScore && (
                          <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-400/30">
                            <Star className="w-3.5 h-3.5 mr-1.5 fill-amber-400" />
                            <span className="font-bold">{strategy.strategyScore}</span>
                            <span className="text-xs opacity-70 ml-1">/ 100</span>
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {strategy.expectedEngagement && (
                          <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-400/30">
                            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                            <span className="font-semibold">{strategy.expectedEngagement}</span>
                          </Badge>
                        )}
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(strategy);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Gradient Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold leading-tight line-clamp-2 text-foreground">
                        {strategy.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {strategy.description}
                      </p>
                    </div>
                  </div>
                
                  {/* Main Content - Horizontal Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                    
                    {/* Left Column: Campaign Metrics */}
                    <div className="space-y-4">
                      {/* Key Metrics Card */}
                      <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-emerald-500/15 via-green-500/10 to-emerald-600/5 border border-emerald-500/20">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        
                        <div className="relative space-y-4">
                          {/* Piece count */}
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-emerald-500/20 backdrop-blur-xl">
                              <Target className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                              <div className="text-3xl font-bold text-white">
                                {strategy.contentMix.reduce((sum, format) => sum + format.count, 0)}
                              </div>
                              <div className="text-xs text-emerald-400/80 font-medium">
                                Content Pieces
                              </div>
                            </div>
                          </div>
                          
                          {/* Reach & Timeline */}
                          {strategy.estimatedReach && (
                            <div className="pt-3 border-t border-emerald-500/20">
                              <div className="text-lg font-semibold text-white">
                                {strategy.estimatedReach}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Estimated Reach
                              </div>
                              {strategy.timeline && (
                                <div className="text-xs text-emerald-400/70 mt-1">
                                  over {strategy.timeline}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Campaign Intensity Indicator */}
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-amber-400">
                            {strategy.contentMix.reduce((sum, format) => sum + format.count, 0) >= 8 ? 'High' : 
                             strategy.contentMix.reduce((sum, format) => sum + format.count, 0) >= 5 ? 'Medium' : 'Light'} Intensity
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ~{strategy.contentMix.reduce((sum, format) => {
                              const baseHours = format.count * 2.5;
                              return sum + baseHours;
                            }, 0).toFixed(0)}h total effort
                          </div>
                        </div>
                      </div>

                      {/* Audience */}
                      {strategy.targetAudience && (
                        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                          <Users className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs font-medium text-blue-400 mb-1">Target Audience</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {strategy.targetAudience}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Content Breakdown */}
                    <div className="space-y-4">
                      {/* Inline Content Mix Summary */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <h5 className="text-sm font-semibold text-foreground">Content Mix</h5>
                          <Badge variant="secondary" className="text-xs bg-primary/10">
                            {strategy.contentMix.length} formats
                          </Badge>
                        </div>
                        
                        {/* Content Type Badges */}
                        <div className="flex flex-wrap gap-2">
                          {strategy.contentMix.map((format, idx) => {
                            const formatInfo = getFormatByIdOrDefault(format.formatId);
                            const FormatIcon = getFormatIconComponent(format.formatId);
                            
                            return (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className="gap-1.5 px-3 py-1.5 bg-background/60 border-border/50 hover:border-primary/30 transition-colors"
                              >
                                <FormatIcon className="h-3.5 w-3.5 text-primary" />
                                <span className="font-semibold">{format.count}×</span>
                                <span>{formatInfo.name}</span>
                              </Badge>
                            );
                          })}
                        </div>

                        {/* Additional Content Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {strategy.contentMix.map((format, idx) => {
                            const formatInfo = getFormatByIdOrDefault(format.formatId);
                            const FormatIcon = getFormatIconComponent(format.formatId);
                            
                            return (
                              <div 
                                key={idx}
                                className="p-3 rounded-lg bg-background/40 border border-border/30 space-y-2"
                              >
                                <div className="flex items-center gap-2">
                                  <FormatIcon className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium">{formatInfo.name}</span>
                                  <Badge variant="secondary" className="text-xs ml-auto">
                                    {format.count}
                                  </Badge>
                                </div>
                                
                                {format.frequency && (
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{format.frequency}</span>
                                  </div>
                                )}
                                
                                {format.seoPotential && (
                                  <Badge 
                                    variant="secondary" 
                                    className={cn(
                                      "text-xs",
                                      format.seoPotential === 'high' && "bg-green-500/20 text-green-400 border-green-500/30",
                                      format.seoPotential === 'medium' && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                                      format.seoPotential === 'low' && "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                    )}
                                  >
                                    {format.seoPotential.toUpperCase()} SEO
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
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

                </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 mt-auto border-t border-border/40">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(strategy.id);
                      }}
                      size="lg"
                      className={cn(
                        "flex-1 gap-2 text-base font-semibold transition-all duration-300",
                        isSelected 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 border-0'
                          : 'bg-gradient-to-r from-white/10 to-white/5 border-white/20 text-white/90 hover:bg-white/20 hover:border-white/30'
                      )}
                    >
                      <FileText className="h-5 w-5" />
                      {isSelected ? 'Selected' : 'Select Strategy'}
                    </Button>
                  </div>

                </GlassCard>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
