import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnalystDataCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  progress?: number;
  color?: 'default' | 'green' | 'amber' | 'red' | 'blue';
  onClick?: () => void;
}

const trendColorMap = {
  up: 'text-emerald-400/80',
  down: 'text-rose-300',
  neutral: 'text-muted-foreground',
};

const progressColorMap = {
  default: 'bg-primary/50',
  green: 'bg-emerald-400/60',
  amber: 'bg-primary/50',
  red: 'bg-rose-300/60',
  blue: 'bg-primary/50',
};

export const AnalystDataCard: React.FC<AnalystDataCardProps> = ({
  label,
  value,
  subtitle,
  trend,
  trendValue,
  progress,
  color = 'default',
  onClick,
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'glass-card p-3.5',
        onClick && 'glass-card-hover cursor-pointer'
      )}
      onClick={onClick}
    >
      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide mb-2">
        {label}
      </p>
      <div className="flex items-end justify-between">
        <p className="text-lg font-bold text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend && (
          <div className={cn('flex items-center gap-0.5', trendColorMap[trend])}>
            <TrendIcon className="w-3.5 h-3.5" />
            {trendValue && <span className="text-[10px] font-medium">{trendValue}</span>}
          </div>
        )}
      </div>
      {subtitle && (
        <p className="text-[10px] text-muted-foreground/50 mt-1.5">{subtitle}</p>
      )}
      {progress !== undefined && (
        <div className="w-full h-1 bg-muted/20 rounded-full mt-3 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', progressColorMap[color])}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};
