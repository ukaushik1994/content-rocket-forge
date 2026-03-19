import React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
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

const colorMap = {
  default: 'text-foreground',
  green: 'text-emerald-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
  blue: 'text-blue-400',
};

const trendColorMap = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  neutral: 'text-muted-foreground',
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
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </p>
      <div className="flex items-end justify-between">
        <p className={cn('text-xl font-bold', colorMap[color])}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend && (
          <div className={cn('flex items-center gap-0.5', trendColorMap[trend])}>
            <TrendIcon className="w-3 h-3" />
            {trendValue && <span className="text-[10px] font-medium">{trendValue}</span>}
          </div>
        )}
      </div>
      {subtitle && (
        <p className="text-[9px] text-muted-foreground/60 mt-1">{subtitle}</p>
      )}
      {progress !== undefined && (
        <Progress value={progress} className="h-1 mt-2" />
      )}
    </div>
  );
};
