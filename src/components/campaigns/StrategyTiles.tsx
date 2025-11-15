import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/GlassCard';
import { Progress } from '@/components/ui/progress';
import { CampaignStrategy } from '@/types/campaign-types';
import { contentFormats } from '@/components/content-repurposing/formats';
import { motion } from 'framer-motion';
import { Check, Edit, RefreshCw, TrendingUp, Clock, Users, Heart, Target, Calendar, Sparkles, Zap, Package, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [expandedFormats, setExpandedFormats] = useState<string[]>([]);

  const getFormatIcon = (formatId: string) => {
    const format = contentFormats.find((f) => f.id === formatId);
    if (!format) {
      console.warn(`⚠️ Unknown format ID: ${formatId}, using default FileText icon`);
      return undefined; // Will use FileText as fallback in rendering
    }
    return format.icon;
  };

  const getFormatName = (formatId: string) => {
    const format = contentFormats.find((f) => f.id === formatId);
    if (!format) {
      console.warn(`⚠️ Unknown format ID: ${formatId}, using formatted version`);
      // Convert "blog-post" to "Blog Post" or "social-twitter" to "Social Twitter"
      return formatId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return format.name;
  };

  const getCategoryGradient = (formatId: string) => {
    // Infer category from format ID
    if (formatId.startsWith('social-')) {
      return 'from-blue-500/20 via-blue-400/10 to-cyan-500/10';
    } else if (formatId === 'blog' || formatId === 'landing-page') {
      return 'from-purple-500/20 via-purple-400/10 to-pink-500/10';
    } else if (formatId === 'script' || formatId.includes('video')) {
      return 'from-red-500/20 via-red-400/10 to-orange-500/10';
    } else if (formatId === 'email') {
      return 'from-green-500/20 via-green-400/10 to-emerald-500/10';
    }
    return 'from-primary/20 via-primary/10 to-transparent';
  };

  const toggleExpandFormats = (strategyId: string) => {
    setExpandedFormats(prev => 
      prev.includes(strategyId) 
        ? prev.filter(id => id !== strategyId)
        : [...prev, strategyId]
    );
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
          const isExpanded = expandedFormats.includes(strategy.id);
          const visibleFormats = isExpanded ? strategy.contentMix : strategy.contentMix.slice(0, 4);

          return (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={cn(
                "relative group",
                isSelected && "ring-2 ring-primary ring-offset-4 shadow-2xl shadow-primary/20"
              )}
            >
              <GlassCard className="p-6 space-y-6 bg-background/60 backdrop-blur-xl hover:bg-background/80 transition-all duration-300">
                
                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {strategy.strategyScore && (
                      <Badge className="bg-gradient-to-r from-primary to-blue-500 text-primary-foreground">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {strategy.strategyScore}/100
                      </Badge>
                    )}
                    {strategy.solutionAlignment && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20">
                        <Zap className="w-3 h-3 mr-1" />
                        {strategy.solutionAlignment}% Aligned
                      </Badge>
                    )}
                  </div>
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(strategy);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Hero Section */}
                <div className="space-y-3">
                  <h4 className="text-xl font-bold leading-tight bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                    {strategy.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {strategy.description}
                  </p>
                  {strategy.keyStrengths && strategy.keyStrengths.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {strategy.keyStrengths.map((strength, i) => (
                        <Badge key={i} variant="outline" className="bg-primary/5 border-primary/20">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content Mix Showcase */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Content Mix
                    </p>
                    {strategy.contentMix.length > 4 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpandFormats(strategy.id)}
                        className="h-auto py-1 text-xs"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            +{strategy.contentMix.length - 4} more
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {visibleFormats.map((item, i) => {
                      const FormatIcon = getFormatIcon(item.formatId);
                      return (
                        <motion.div
                          key={item.formatId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Card className={cn(
                            "p-4 bg-gradient-to-br backdrop-blur-sm border-primary/20",
                            "hover:border-primary/40 transition-all duration-300",
                            "hover:shadow-lg",
                            getCategoryGradient(item.formatId)
                          )}>
                            <div className="flex flex-col items-center gap-2 text-center">
                              <div className="p-3 rounded-xl bg-background/50 group-hover:bg-background/70 transition-colors">
                                {FormatIcon && <FormatIcon className="w-5 h-5 text-primary" />}
                              </div>
                              <div className="text-2xl font-bold text-primary">{item.count}</div>
                              <div className="text-xs font-medium leading-tight">{getFormatName(item.formatId)}</div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline & Milestones */}
                {(strategy.timeline || strategy.milestones) && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Timeline</span>
                      {strategy.timeline && (
                        <Badge variant="secondary" className="text-xs">
                          {strategy.timeline}
                        </Badge>
                      )}
                    </div>
                    {strategy.milestones && strategy.milestones.length > 0 && (
                      <div className="space-y-3">
                        <div className="relative">
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-primary via-blue-500 to-green-500"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          {strategy.milestones.map((milestone, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <Badge variant="outline" className="shrink-0">Week {milestone.week}</Badge>
                              <div className="space-y-1">
                                <p className="text-muted-foreground">{milestone.description}</p>
                                <div className="flex flex-wrap gap-1">
                                  {milestone.contentTypes.map((type, j) => (
                                    <Badge key={j} variant="secondary" className="text-xs">
                                      {getFormatName(type)}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Expected Outcomes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Reach Card */}
                  {strategy.estimatedReach && (
                    <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-semibold uppercase tracking-wide">Reach</span>
                        </div>
                        <div className="text-2xl font-bold">{strategy.estimatedReach}</div>
                        <Progress value={75} className="h-1.5 bg-blue-500/20" />
                        <p className="text-xs text-muted-foreground">Estimated impressions</p>
                      </div>
                    </Card>
                  )}
                  
                  {/* Engagement Card */}
                  {strategy.expectedEngagement && (
                    <Card className={cn(
                      "p-4 bg-gradient-to-br border",
                      strategy.expectedEngagement === 'high' && "from-green-500/10 to-emerald-500/10 border-green-500/20",
                      strategy.expectedEngagement === 'medium' && "from-yellow-500/10 to-orange-500/10 border-yellow-500/20",
                      strategy.expectedEngagement === 'low' && "from-gray-500/10 to-slate-500/10 border-gray-500/20"
                    )}>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Heart className={cn(
                            "w-4 h-4",
                            strategy.expectedEngagement === 'high' && "text-green-500",
                            strategy.expectedEngagement === 'medium' && "text-yellow-500",
                            strategy.expectedEngagement === 'low' && "text-gray-500"
                          )} />
                          <span className="text-xs font-semibold uppercase tracking-wide">Engagement</span>
                        </div>
                        <div className="text-2xl font-bold capitalize">{strategy.expectedEngagement}</div>
                        <Progress 
                          value={strategy.expectedEngagement === 'high' ? 85 : strategy.expectedEngagement === 'medium' ? 60 : 35} 
                          className="h-1.5"
                        />
                        <p className="text-xs text-muted-foreground">Interaction potential</p>
                      </div>
                    </Card>
                  )}
                  
                  {/* Audience Card */}
                  {strategy.targetAudience && (
                    <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-500" />
                          <span className="text-xs font-semibold uppercase tracking-wide">Audience</span>
                        </div>
                        <div className="text-sm font-medium leading-tight line-clamp-2">{strategy.targetAudience}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          Target segment
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Strategy Intelligence Panel */}
                {(strategy.strategyScore || strategy.competitorDifferentiation) && (
                  <Card className="p-4 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border-primary/20">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="font-semibold">Strategy Intelligence</span>
                        </div>
                        {strategy.strategyScore && (
                          <Badge variant="secondary">{strategy.strategyScore}/100</Badge>
                        )}
                      </div>
                      
                      {strategy.solutionAlignment && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Solution Alignment</span>
                            <span className="font-medium">{strategy.solutionAlignment}%</span>
                          </div>
                          <Progress value={strategy.solutionAlignment} className="h-2" />
                        </div>
                      )}
                      
                      {strategy.competitorDifferentiation && (
                        <div className="p-3 bg-secondary/50 rounded-lg text-sm">
                          <span className="font-medium text-primary">Competitive Edge: </span>
                          <span className="text-muted-foreground">{strategy.competitorDifferentiation}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    AI-powered strategy
                  </span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(strategy.id);
                    }}
                    className={cn(
                      "bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90",
                      "transition-all duration-300",
                      isSelected && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Selected
                      </>
                    ) : (
                      'Select Strategy'
                    )}
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
