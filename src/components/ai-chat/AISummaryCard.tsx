import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AISummaryCardProps {
  chartData: any[];
  dataKeys: string[];
  title?: string;
  onFeedback?: (helpful: boolean) => void;
  className?: string;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({
  chartData,
  dataKeys,
  title,
  onFeedback,
  className
}) => {
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
    
    let insight = '';
    if (variance > 100) {
      insight = `"${highestName}" significantly outperforms at ${highestValue.toLocaleString()}, while "${lowestName}" at ${lowestValue.toLocaleString()} shows room for improvement. Consider analyzing what's driving this ${Math.round(variance)}% performance gap.`;
    } else if (variance > 50) {
      insight = `Performance varies moderately across your data. "${highestName}" leads at ${highestValue.toLocaleString()}, with "${lowestName}" at ${lowestValue.toLocaleString()}. The overall trend suggests balanced distribution.`;
    } else {
      insight = `Your data shows consistent performance across all items, averaging ${Math.round(avg).toLocaleString()}. "${highestName}" edges ahead slightly, indicating a stable and predictable pattern.`;
    }

    return insight;
  }, [chartData, dataKeys]);

  if (!summary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-white/[0.03] backdrop-blur-sm",
        "border border-white/10",
        "p-4",
        className
      )}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 opacity-50 pointer-events-none" />
      
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      {/* Header */}
      <div className="relative flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-foreground/70">
          AI Summary
        </span>
      </div>

      {/* Summary text */}
      <p className="relative text-sm leading-relaxed text-foreground/80 italic">
        "{summary}"
      </p>

      {/* Feedback buttons */}
      {onFeedback && (
        <div className="relative flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback(true)}
            className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
          >
            <ThumbsUp className="w-3 h-3" />
            Helpful
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback(false)}
            className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
          >
            <ThumbsDown className="w-3 h-3" />
            Not useful
          </Button>
        </div>
      )}
    </motion.div>
  );
};
