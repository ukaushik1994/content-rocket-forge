import React, { useState } from 'react';
import { CampaignStrategy } from '@/types/campaign-types';
import { motion } from 'framer-motion';
import { Check, ChevronDown, BarChart3, Calendar, Users, Target, TrendingUp, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface StrategySummaryCardsProps {
  strategies: CampaignStrategy[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRegenerate: () => void;
  onEditAnswers: () => void;
  isLoading?: boolean;
  onCompare?: (strategyIds: string[]) => void;
}

const complexityLabels = {
  beginner: { text: 'Beginner', color: 'text-green-500' },
  skilled: { text: 'Skilled', color: 'text-yellow-500' },
  expert: { text: 'Expert', color: 'text-red-500' }
};

const formatIcons: Record<string, string> = {
  'blog-post': '📝',
  'social-post': '📱',
  'video': '🎥',
  'infographic': '📊',
  'case-study': '📄',
  'guide': '📖',
  'whitepaper': '📑',
  'email': '✉️',
  'webinar': '🎯',
  'podcast': '🎙️',
  'google-ads': '🎯'
};

export function StrategySummaryCards({
  strategies,
  selectedId,
  onSelect,
  onRegenerate,
  onEditAnswers,
  isLoading,
  onCompare
}: StrategySummaryCardsProps) {
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  
  const toggleComparison = (id: string) => {
    setSelectedForComparison(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (onCompare && selectedForComparison.length >= 2) {
      onCompare(selectedForComparison);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold text-foreground">
          Choose Your Campaign Strategy
        </h3>
        <p className="text-muted-foreground">
          Expand cards to see full details, select one to proceed, or compare multiple strategies.
        </p>
      </div>

      {/* Compare Button */}
      {selectedForComparison.length >= 2 && (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={handleCompare}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Compare {selectedForComparison.length} Strategies
          </Button>
        </div>
      )}

      {/* Strategy Cards */}
      <Accordion type="single" collapsible className="space-y-6">
        {strategies.map((strategy, index) => {
          const isSelected = selectedId === strategy.id;
          const isMarkedForComparison = selectedForComparison.includes(strategy.id);
          
          return (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative rounded-xl border-2 transition-all",
                "bg-card shadow-sm hover:shadow-lg",
                isSelected 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <AccordionItem value={strategy.id} className="border-0">
                {/* Card Header - Always Visible */}
                <div className="p-6">
                  {/* Selected Checkmark */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full p-2 shadow-lg z-10"
                    >
                      <Check className="h-5 w-5" />
                    </motion.div>
                  )}

                  {/* Comparison Checkbox */}
                  <div className="absolute top-4 left-4">
                    <input
                      type="checkbox"
                      checked={isMarkedForComparison}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleComparison(strategy.id);
                      }}
                      className="h-4 w-4 rounded border-border"
                    />
                  </div>

                  <div className="ml-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-semibold text-foreground">
                        {strategy.title}
                      </h4>
                      
                      {/* Complexity Level */}
                      {strategy.totalEffort?.complexity && (
                        <div className={cn("text-xs font-medium whitespace-nowrap ml-4", complexityLabels[strategy.totalEffort.complexity].color)}>
                          ⏱️ {complexityLabels[strategy.totalEffort.complexity].text}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>

                    {/* Content Mix Preview */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {strategy.contentMix.slice(0, 4).map((item, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs"
                          >
                            <span>{formatIcons[item.formatId] || '📄'}</span>
                            <span className="font-medium">{item.count}</span>
                            <span className="capitalize">
                              {item.formatId.replace('-', ' ')}
                            </span>
                          </div>
                        ))}
                        {strategy.contentMix.length > 4 && (
                          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-xs">
                            +{strategy.contentMix.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    {(strategy.totalEffort || strategy.seoIntelligence) && (
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {strategy.totalEffort?.hours && (
                          <span>⏱️ {strategy.totalEffort.hours} hours</span>
                        )}
                        {strategy.seoIntelligence?.avgRankingDifficulty && (
                          <span>🎯 {strategy.seoIntelligence.avgRankingDifficulty} SEO difficulty</span>
                        )}
                      </div>
                    )}

                    {/* Expand Trigger */}
                    <AccordionTrigger className="pt-4 hover:no-underline">
                      <span className="text-sm text-primary">View Full Details</span>
                    </AccordionTrigger>
                  </div>
                </div>

                {/* Expandable Content - Full Details */}
                <AccordionContent>
                  <div className="px-6 pb-6 space-y-6 border-t border-border pt-6">
                    {/* SERP Insights */}
                    {strategy.seoIntelligence && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          SERP Insights
                        </div>
                        <div className="pl-6 space-y-1 text-sm text-muted-foreground">
                          <div>Primary Keyword: <span className="font-medium text-foreground">{strategy.seoIntelligence.primaryKeyword}</span></div>
                          <div>Ranking Difficulty: <span className={cn("font-medium", 
                            strategy.seoIntelligence.avgRankingDifficulty === 'low' && 'text-green-500',
                            strategy.seoIntelligence.avgRankingDifficulty === 'medium' && 'text-yellow-500',
                            strategy.seoIntelligence.avgRankingDifficulty === 'high' && 'text-red-500'
                          )}>{strategy.seoIntelligence.avgRankingDifficulty}</span></div>
                          {strategy.seoIntelligence.expectedSeoImpact && (
                            <div>Expected Impact: {strategy.seoIntelligence.expectedSeoImpact}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timeline Breakdown */}
                    {strategy.milestones && strategy.milestones.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-primary" />
                          Timeline Breakdown
                        </div>
                        <div className="pl-6 space-y-2">
                          {strategy.milestones.map((milestone, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="font-medium text-foreground">Week {milestone.week}</div>
                              <div className="text-muted-foreground">{milestone.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resource Requirements */}
                    {strategy.totalEffort && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Package className="h-4 w-4 text-primary" />
                          Resource Requirements
                        </div>
                        <div className="pl-6 space-y-1 text-sm text-muted-foreground">
                          <div>Total Hours: <span className="font-medium text-foreground">{strategy.totalEffort.hours} hours</span></div>
                          <div>Complexity: <span className={cn("font-medium", complexityLabels[strategy.totalEffort.complexity].color)}>
                            {complexityLabels[strategy.totalEffort.complexity].text}
                          </span></div>
                        </div>
                      </div>
                    )}

                    {/* Expected Metrics */}
                    {strategy.expectedMetrics && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Expected Metrics
                        </div>
                        <div className="pl-6 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>Impressions: <span className="font-medium text-foreground">
                            {strategy.expectedMetrics.impressions.min.toLocaleString()} - {strategy.expectedMetrics.impressions.max.toLocaleString()}
                          </span></div>
                          <div>Engagement: <span className="font-medium text-foreground">
                            {strategy.expectedMetrics.engagement.min.toLocaleString()} - {strategy.expectedMetrics.engagement.max.toLocaleString()}
                          </span></div>
                          {strategy.expectedMetrics.conversions && (
                            <div className="col-span-2">Conversions: <span className="font-medium text-foreground">
                              {strategy.expectedMetrics.conversions.min} - {strategy.expectedMetrics.conversions.max}
                            </span></div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Distribution Strategy */}
                    {strategy.distributionStrategy && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Target className="h-4 w-4 text-primary" />
                          Distribution Strategy
                        </div>
                        <div className="pl-6 space-y-1 text-sm text-muted-foreground">
                          <div>Channels: <span className="font-medium text-foreground">{strategy.distributionStrategy.channels.join(', ')}</span></div>
                          <div>Cadence: {strategy.distributionStrategy.postingCadence}</div>
                          {strategy.distributionStrategy.estimatedTrafficLift && (
                            <div>Traffic Lift: {strategy.distributionStrategy.estimatedTrafficLift}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Audience Intelligence */}
                    {strategy.audienceIntelligence && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Users className="h-4 w-4 text-primary" />
                          Audience Intelligence
                        </div>
                        <div className="pl-6 space-y-1 text-sm text-muted-foreground">
                          {strategy.audienceIntelligence.personas && strategy.audienceIntelligence.personas.length > 0 && (
                            <div>Personas: <span className="font-medium text-foreground">{strategy.audienceIntelligence.personas.join(', ')}</span></div>
                          )}
                          {strategy.audienceIntelligence.messagingAngle && (
                            <div>Messaging: {strategy.audienceIntelligence.messagingAngle}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Select Button */}
                    <div className="pt-4">
                      <Button
                        onClick={() => !isLoading && onSelect(strategy.id)}
                        disabled={isLoading}
                        className="w-full"
                        size="lg"
                      >
                        {isSelected ? 'Selected' : 'Select This Strategy'}
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          );
        })}
      </Accordion>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <Button
          variant="outline"
          onClick={onEditAnswers}
          disabled={isLoading}
          className="gap-2"
        >
          ← Edit My Answers
        </Button>
        <Button
          variant="secondary"
          onClick={onRegenerate}
          disabled={isLoading}
          className="gap-2"
        >
          🔄 Regenerate Options
        </Button>
      </div>

      {/* Help Text */}
      <p className="text-xs text-center text-muted-foreground">
        Can't decide? Choose the one that aligns best with your timeline and resources.
      </p>
    </div>
  );
}
