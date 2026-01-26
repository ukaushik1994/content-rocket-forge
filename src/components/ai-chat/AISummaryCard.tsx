import React, { useMemo } from 'react';
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
    <div
      className={cn(
        "rounded-lg p-4",
        "bg-card/50 border border-border/50",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          AI Summary
        </span>
      </div>

      {/* Summary text */}
      <p className="text-sm leading-relaxed text-foreground/80 italic">
        "{summary}"
      </p>

      {/* Feedback buttons */}
      {onFeedback && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback(true)}
            className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-emerald-500"
          >
            <ThumbsUp className="w-3 h-3" />
            Helpful
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback(false)}
            className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-red-500"
          >
            <ThumbsDown className="w-3 h-3" />
            Not useful
          </Button>
        </div>
      )}
    </div>
  );
};
