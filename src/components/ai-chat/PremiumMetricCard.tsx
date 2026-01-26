import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumMetricCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  tooltip?: string;
  index?: number;
}

export const PremiumMetricCard: React.FC<PremiumMetricCardProps> = ({
  label,
  value,
  trend = 'neutral',
  trendValue,
  tooltip,
  index = 0
}) => {
  const getTrendConfig = () => {
    switch (trend) {
      case 'up':
        return {
          icon: TrendingUp,
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
          textColor: 'text-emerald-500',
          glowColor: 'shadow-emerald-500/10'
        };
      case 'down':
        return {
          icon: TrendingDown,
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          textColor: 'text-red-500',
          glowColor: 'shadow-red-500/10'
        };
      default:
        return {
          icon: Minus,
          bgColor: 'bg-muted',
          borderColor: 'border-border/50',
          textColor: 'text-muted-foreground',
          glowColor: ''
        };
    }
  };

  const trendConfig = getTrendConfig();
  const TrendIcon = trendConfig.icon;

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card 
        className={cn(
          "p-4 h-full transition-all duration-200",
          "bg-card hover:bg-card/80",
          "border",
          trendConfig.borderColor,
          trendConfig.glowColor && `shadow-lg ${trendConfig.glowColor}`,
          "cursor-default"
        )}
      >
        {/* Trend badge and info */}
        <div className="flex items-center justify-between mb-2">
          <div className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium",
            trendConfig.bgColor,
            trendConfig.textColor
          )}>
            <TrendIcon className="w-3 h-3" />
            {trendValue && <span>{trendValue}</span>}
          </div>
          {tooltip && (
            <Info className="w-3 h-3 text-muted-foreground/50" />
          )}
        </div>

        {/* Value */}
        <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
          {formatValue(value)}
        </p>

        {/* Label */}
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {label}
        </p>
      </Card>
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
