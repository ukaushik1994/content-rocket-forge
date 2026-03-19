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
  comparisonPeriod?: string;
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
        return { icon: TrendingUp, textColor: 'text-emerald-500', glowColor: 'rgba(16,185,129,0.6)', bgGlow: 'rgba(16,185,129,0.04)' };
      case 'down':
        return { icon: TrendingDown, textColor: 'text-red-500', glowColor: 'rgba(239,68,68,0.6)', bgGlow: 'rgba(239,68,68,0.04)' };
      default:
        return { icon: Minus, textColor: 'text-muted-foreground', glowColor: 'rgba(139,92,246,0.4)', bgGlow: 'rgba(139,92,246,0.03)' };
    }
  };

  const trendConfig = getTrendConfig();
  const TrendIcon = trendConfig.icon;

  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return Math.round(val).toLocaleString();
  };

  const cardContent = (
    <div
      className="glass-card glass-card-hover relative p-6 h-full overflow-hidden"
      style={{
        background: `radial-gradient(circle at top right, ${trendConfig.bgGlow}, transparent 70%), rgba(255,255,255,0.04)`,
      }}
    >
      {/* Top gradient glow strip */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, ${trendConfig.glowColor}, transparent)`,
        }}
      />

      {/* Header row: trend badge */}
      <div className="flex items-center justify-between mb-3">
        <div className={cn("flex items-center gap-1.5 text-xs font-medium", trendConfig.textColor)}>
          <TrendIcon className="w-3.5 h-3.5" />
          {trendValue && <span>{trendValue}</span>}
        </div>
        {tooltip && <Info className="w-3 h-3 text-muted-foreground/40" />}
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-foreground tabular-nums tracking-tight">
        {typeof value === 'string' && value.startsWith('$') ? '$' : ''}
        {formatValue(numericValue)}
        {typeof value === 'string' && value.endsWith('%') ? '%' : ''}
      </p>

      {/* Label */}
      <p className="text-xs text-muted-foreground/70 mt-2.5 truncate font-medium">{label}</p>

      {/* Comparison row */}
      {comparisonValue !== undefined && (
        <p className="text-[10px] text-muted-foreground/50 mt-3 truncate">
          <span className="text-muted-foreground/30">{comparisonPeriod || comparisonLabel}:</span>{' '}
          <span className="font-medium">{comparisonValue.toLocaleString()}</span>
        </p>
      )}

      {/* Target indicator */}
      {target !== undefined && (
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex-1 h-1.5 bg-muted/20 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", numericValue >= target ? "bg-emerald-500" : "bg-amber-500")}
              style={{
                width: `${Math.min((numericValue / target) * 100, 100)}%`,
                boxShadow: `0 0 8px ${numericValue >= target ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`,
              }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground/40">{targetLabel}</span>
        </div>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[200px] text-xs">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardContent;
};
