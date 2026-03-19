import React, { useMemo, useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AISummaryCardProps {
  chartData: any[];
  dataKeys: string[];
  title?: string;
  timeframe?: string;
  dataSource?: string;
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
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean | null>(null);
  
  const summary = useMemo(() => {
    if (!chartData?.length || !dataKeys?.length) return null;

    const firstKey = dataKeys[0];
    const sortedData = [...chartData].sort((a, b) => (b[firstKey] || 0) - (a[firstKey] || 0));
    const highest = sortedData[0];
    const lowest = sortedData[sortedData.length - 1];
    if (!highest || !lowest) return null;

    const highestName = highest.name || highest.label || 'Top item';
    const lowestName = lowest.name || lowest.label || 'Bottom item';
    const highestValue = highest[firstKey];
    const lowestValue = lowest[firstKey];
    const total = chartData.reduce((sum, item) => sum + (Number(item[firstKey]) || 0), 0);
    const avg = total / chartData.length;
    const variance = ((highestValue - lowestValue) / avg) * 100;
    const timeContext = timeframe ? ` (${timeframe.toLowerCase()})` : '';
    
    if (variance > 100) {
      return `"${highestName}" significantly outperforms at ${highestValue.toLocaleString()}${timeContext}, while "${lowestName}" at ${lowestValue.toLocaleString()} shows room for improvement. Consider analyzing what's driving this ${Math.round(variance)}% performance gap.`;
    } else if (variance > 50) {
      return `Performance varies moderately across your data${timeContext}. "${highestName}" leads at ${highestValue.toLocaleString()}, with "${lowestName}" at ${lowestValue.toLocaleString()}. The overall trend suggests balanced distribution.`;
    } else {
      return `Your data shows consistent performance across all items${timeContext}, averaging ${Math.round(avg).toLocaleString()}. "${highestName}" edges ahead slightly, indicating a stable and predictable pattern.`;
    }
  }, [chartData, dataKeys, timeframe]);

  const handleFeedback = (helpful: boolean) => {
    setFeedbackSubmitted(helpful);
    onFeedback?.(helpful);
  };

  if (!summary) return null;

  return (
    <div
      className={cn("glass-card p-5 relative overflow-hidden", className)}
      style={{
        borderLeft: '2px solid rgba(139,92,246,0.3)',
      }}
    >
      {/* Subtle ambient glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
        }}
      />
      <div className="flex items-start gap-3 relative">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(139,92,246,0.1)' }}>
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm leading-relaxed text-foreground/75">{summary}</p>
        </div>
      </div>

      {onFeedback && (
        <div className="flex items-center gap-1 mt-3 ml-10">
          <AnimatePresence mode="wait">
            {feedbackSubmitted !== null ? (
              <motion.div key="thanks" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-emerald-500 text-[10px]">
                <CheckCircle2 className="w-3 h-3" />
                <span>Thanks for your feedback!</span>
              </motion.div>
            ) : (
              <motion.div key="buttons" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleFeedback(true)} className="h-6 text-[10px] px-2 text-muted-foreground/50 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors">
                  <ThumbsUp className="w-2.5 h-2.5 mr-1" /> Helpful
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleFeedback(false)} className="h-6 text-[10px] px-2 text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                  <ThumbsDown className="w-2.5 h-2.5 mr-1" /> Not useful
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
