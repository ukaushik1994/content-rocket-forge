import React from 'react';
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
  comparisonValue?: number;
  comparisonLabel?: string;
  comparisonPeriod?: string; // "vs. last week", "vs. last month" - always shown
  target?: number;
  targetLabel?: string;
}

export const PremiumMetricCard: React.FC<PremiumMetricCardProps> = ({
  label,
  value,
  trend = 'neutral',
  trendValue,
  tooltip,
  comparisonValue,
  comparisonLabel = 'vs. previous',
  comparisonPeriod,
  target,
  targetLabel = 'Target'
}) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]/g, '')) || 0;

  const getTrendConfig = () => {
    switch (trend) {
      case 'up':
        return {
          icon: TrendingUp,
          borderColor: 'border-l-emerald-500',
          textColor: 'text-emerald-500'
        };
      case 'down':
        return {
          icon: TrendingDown,
          borderColor: 'border-l-red-500',
          textColor: 'text-red-500'
        };
      default:
        return {
          icon: Minus,
          borderColor: 'border-l-muted-foreground/30',
          textColor: 'text-muted-foreground'
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

  const cardContent = (
    <div 
      className={cn(
        "relative p-5 h-full rounded-lg",
        "bg-card/50",
        "border border-border/50",
        "border-l-2",
        trendConfig.borderColor
      )}
    >
      {/* Header row: trend badge */}
      <div className="flex items-center justify-between mb-3">
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          trendConfig.textColor
        )}>
          <TrendIcon className="w-3 h-3" />
          {trendValue && <span>{trendValue}</span>}
        </div>
        
        {/* Info icon for tooltip */}
        {tooltip && (
          <Info className="w-3 h-3 text-muted-foreground" />
        )}
      </div>

      {/* Value */}
      <p className="text-2xl font-semibold text-foreground tabular-nums tracking-tight">
        {typeof value === 'string' && value.startsWith('$') ? '$' : ''}
        {formatValue(numericValue)}
        {typeof value === 'string' && value.endsWith('%') ? '%' : ''}
      </p>

      {/* Label */}
      <p className="text-xs text-muted-foreground mt-2 truncate">
        {label}
      </p>

      {/* Comparison row - always shown when data exists */}
      {comparisonValue !== undefined && (
        <p className="text-[10px] text-muted-foreground/60 mt-3 truncate">
          <span className="text-muted-foreground/40">{comparisonPeriod || comparisonLabel}:</span>{' '}
          <span className="font-medium">{comparisonValue.toLocaleString()}</span>
        </p>
      )}

      {/* Target indicator */}
      {target !== undefined && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="flex-1 h-1 bg-muted/30 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                numericValue >= target ? "bg-emerald-500" : "bg-amber-500"
              )}
              style={{ width: `${Math.min((numericValue / target) * 100, 100)}%` }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground/50">{targetLabel}</span>
        </div>
      )}
    </div>
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
