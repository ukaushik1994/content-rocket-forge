import React, { useMemo, useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AISummaryCardProps {
  chartData: any[];
  dataKeys: string[];
  title?: string;
  timeframe?: string; // "Last 30 days", etc.
  dataSource?: string; // "Content Analytics", etc.
  onFeedback?: (helpful: boolean) => void;
  className?: string;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({
  chartData,
  dataKeys,
  title,
  timeframe = 'Last 30 days',
  dataSource,
  onFeedback,
  className
}) => {
  // Issue #3 Fix: Track feedback submission state
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean | null>(null);
  
  // Generate AI summary from data
  const summary = useMemo(() => {
    if (!chartData?.length || !dataKeys?.length) {
      return null;
    }

    // Find highest and lowest performers
    const firstKey = dataKeys[0];
    const sortedData = [...chartData].sort((a, b) => (b[firstKey] || 0) - (a[firstKey] || 0));
    
    const highest = sortedData[0];
    const lowest = sortedData[sortedData.length - 1];
    
    if (!highest || !lowest) return null;

    const highestName = highest.name || highest.label || 'Top item';
    const lowestName = lowest.name || lowest.label || 'Bottom item';
    const highestValue = highest[firstKey];
    const lowestValue = lowest[firstKey];

    // Calculate average
    const total = chartData.reduce((sum, item) => sum + (Number(item[firstKey]) || 0), 0);
    const avg = total / chartData.length;
    
    // Generate insight based on variance
    const variance = ((highestValue - lowestValue) / avg) * 100;
    
    // Add timeframe context to insights
    const timeContext = timeframe ? ` (${timeframe.toLowerCase()})` : '';
    
    let insight = '';
    if (variance > 100) {
      insight = `"${highestName}" significantly outperforms at ${highestValue.toLocaleString()}${timeContext}, while "${lowestName}" at ${lowestValue.toLocaleString()} shows room for improvement. Consider analyzing what's driving this ${Math.round(variance)}% performance gap.`;
    } else if (variance > 50) {
      insight = `Performance varies moderately across your data${timeContext}. "${highestName}" leads at ${highestValue.toLocaleString()}, with "${lowestName}" at ${lowestValue.toLocaleString()}. The overall trend suggests balanced distribution.`;
    } else {
      insight = `Your data shows consistent performance across all items${timeContext}, averaging ${Math.round(avg).toLocaleString()}. "${highestName}" edges ahead slightly, indicating a stable and predictable pattern.`;
    }

    return insight;
  }, [chartData, dataKeys, timeframe]);

  // Handle feedback with visual confirmation
  const handleFeedback = (helpful: boolean) => {
    setFeedbackSubmitted(helpful);
    onFeedback?.(helpful);
  };

  if (!summary) return null;

  return (
    <div
      className={cn(
        "rounded-lg p-4",
        "bg-transparent border border-border/20",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm leading-relaxed text-foreground/70">
            {summary}
          </p>
        </div>
      </div>

      {/* Issue #3 Fix: Responsive feedback row with visual confirmation */}
      {onFeedback && (
        <div className="flex items-center gap-1 mt-3 ml-7">
          <AnimatePresence mode="wait">
            {feedbackSubmitted !== null ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-emerald-500 text-[10px]"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Thanks for your feedback!</span>
              </motion.div>
            ) : (
              <motion.div
                key="buttons"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback(true)}
                  className="h-6 text-[10px] px-2 text-muted-foreground/50 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                >
                  <ThumbsUp className="w-2.5 h-2.5 mr-1" />
                  Helpful
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback(false)}
                  className="h-6 text-[10px] px-2 text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <ThumbsDown className="w-2.5 h-2.5 mr-1" />
                  Not useful
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
