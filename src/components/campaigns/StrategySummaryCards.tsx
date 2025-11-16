import React from 'react';
import { CampaignStrategySummary } from '@/types/campaign-types';
import { motion } from 'framer-motion';
import { Check, Sparkles, Target, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StrategySummaryCardsProps {
  summaries: CampaignStrategySummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRegenerate: () => void;
  onEditAnswers: () => void;
  isLoading?: boolean;
}

const focusIcons = {
  awareness: Users,
  conversion: Target,
  engagement: Sparkles,
  education: TrendingUp
};

const focusColors = {
  awareness: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  conversion: 'bg-green-500/10 text-green-600 border-green-500/20',
  engagement: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  education: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
};

const effortLabels = {
  low: { text: 'Low Effort', color: 'text-green-600' },
  medium: { text: 'Medium Effort', color: 'text-yellow-600' },
  high: { text: 'High Effort', color: 'text-red-600' }
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
  'podcast': '🎙️'
};

export function StrategySummaryCards({
  summaries,
  selectedId,
  onSelect,
  onRegenerate,
  onEditAnswers,
  isLoading
}: StrategySummaryCardsProps) {
  
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold text-foreground">
          Choose Your Campaign Strategy
        </h3>
        <p className="text-muted-foreground">
          Select the approach that best fits your goals. We'll then generate a detailed strategy.
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {summaries.map((summary, index) => {
          const FocusIcon = focusIcons[summary.focus];
          const isSelected = selectedId === summary.id;
          
          return (
            <motion.div
              key={summary.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative p-6 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02]",
                "bg-card shadow-sm hover:shadow-lg",
                isSelected 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => !isLoading && onSelect(summary.id)}
            >
              {/* Selected Checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full p-2 shadow-lg"
                >
                  <Check className="h-5 w-5" />
                </motion.div>
              )}

              {/* Header with Focus Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-foreground mb-1">
                    {summary.title}
                  </h4>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                    focusColors[summary.focus]
                  )}>
                    <FocusIcon className="h-3.5 w-3.5" />
                    {summary.focus.charAt(0).toUpperCase() + summary.focus.slice(1)}
                  </div>
                </div>
                
                {/* Effort Level */}
                <div className={cn("text-xs font-medium", effortLabels[summary.effortLevel].color)}>
                  ⏱️ {effortLabels[summary.effortLevel].text}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {summary.description}
              </p>

              {/* Content Mix */}
              <div className="mb-4">
                <div className="text-xs font-medium text-muted-foreground mb-2">Content Mix:</div>
                <div className="flex flex-wrap gap-2">
                  {summary.contentMix.map((item, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs"
                    >
                      <span>{formatIcons[item.formatId] || '📄'}</span>
                      <span className="font-medium">{item.count}</span>
                      <span className="capitalize">
                        {item.formatId.replace('-', ' ')}
                        {item.count > 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expected Outcome */}
              <div className="pt-4 border-t border-border">
                <div className="text-xs font-medium text-muted-foreground mb-1">Expected Outcome:</div>
                <p className="text-sm text-foreground">
                  {summary.expectedOutcome}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

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
