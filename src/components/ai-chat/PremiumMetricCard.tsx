import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { MiniSparkline } from './MiniSparkline';
import { cn } from '@/lib/utils';

interface PremiumMetricCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  tooltip?: string;
  index?: number;
  sparklineData?: number[];
  comparisonValue?: number;
  comparisonLabel?: string;
  showComparison?: boolean;
}

export const PremiumMetricCard: React.FC<PremiumMetricCardProps> = ({
  label,
  value,
  trend = 'neutral',
  trendValue,
  tooltip,
  index = 0,
  sparklineData,
  comparisonValue,
  comparisonLabel = 'vs. previous',
  showComparison = false
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]/g, '')) || 0;

  // Animated counter effect
  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number | null = null;
    const duration = 800;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(numericValue * easeOutCubic);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, numericValue]);

  const getTrendConfig = () => {
    switch (trend) {
      case 'up':
        return {
          icon: TrendingUp,
          borderColor: 'border-l-emerald-500',
          bgColor: 'bg-emerald-500/5',
          badgeBg: 'bg-emerald-500/10',
          textColor: 'text-emerald-500',
          sparklineColor: 'hsl(142 71% 45%)'
        };
      case 'down':
        return {
          icon: TrendingDown,
          borderColor: 'border-l-red-500',
          bgColor: 'bg-red-500/5',
          badgeBg: 'bg-red-500/10',
          textColor: 'text-red-500',
          sparklineColor: 'hsl(0 84% 60%)'
        };
      default:
        return {
          icon: Minus,
          borderColor: 'border-l-muted-foreground/30',
          bgColor: 'bg-white/[0.02]',
          badgeBg: 'bg-muted/50',
          textColor: 'text-muted-foreground',
          sparklineColor: 'hsl(var(--muted-foreground))'
        };
    }
  };

  const trendConfig = getTrendConfig();
  const TrendIcon = trendConfig.icon;

  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return Math.round(val).toLocaleString();
  };

  // Generate mock sparkline data if not provided
  const sparkData = sparklineData || Array.from({ length: 7 }, () => 
    numericValue * (0.7 + Math.random() * 0.6)
  );

  const cardContent = (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="h-full"
    >
      <div 
        className={cn(
          "relative p-4 h-full rounded-xl transition-all duration-200",
          "bg-white/[0.03] backdrop-blur-sm",
          "border border-white/10",
          "border-l-2",
          trendConfig.borderColor,
          "cursor-default overflow-hidden"
        )}
      >
        {/* Subtle glass inner glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        
        {/* Header row: trend badge and sparkline */}
        <div className="flex items-center justify-between mb-2 relative">
          <div className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium",
            trendConfig.badgeBg,
            trendConfig.textColor
          )}>
            <TrendIcon className="w-3 h-3" />
            {trendValue && <span>{trendValue}</span>}
          </div>
          
          {/* Mini Sparkline */}
          <MiniSparkline 
            data={sparkData} 
            trend={trend}
            height={20}
            width={40}
          />
        </div>

        {/* Value with animated counter */}
        <p className="text-xl font-semibold text-foreground tabular-nums tracking-tight relative">
          {typeof value === 'string' && value.startsWith('$') ? '$' : ''}
          {formatValue(displayValue)}
          {typeof value === 'string' && value.endsWith('%') ? '%' : ''}
        </p>

        {/* Label */}
        <p className="text-xs text-foreground/60 mt-1 truncate relative">
          {label}
        </p>

        {/* Comparison row (optional) */}
        {showComparison && comparisonValue !== undefined && (
          <p className="text-[10px] text-foreground/40 mt-2 truncate relative">
            {comparisonLabel}: {comparisonValue.toLocaleString()}
          </p>
        )}

        {/* Info icon for tooltip */}
        {tooltip && (
          <div className="absolute top-3 right-3">
            <Info className="w-3 h-3 text-foreground/20" />
          </div>
        )}
      </div>
    </motion.div>
  );

  if (tooltip) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            {cardContent}
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[200px] text-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardContent;
};
