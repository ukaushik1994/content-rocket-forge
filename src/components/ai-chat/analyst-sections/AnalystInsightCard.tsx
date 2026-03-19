import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, AlertTriangle, Sparkles, TrendingUp, Info } from 'lucide-react';

interface AnalystInsightCardProps {
  title: string;
  description?: string;
  dotColor?: 'green' | 'amber' | 'red' | 'blue' | 'purple';
  onExplore?: () => void;
}

const iconMap = {
  red: AlertTriangle,
  amber: AlertTriangle,
  green: Sparkles,
  blue: TrendingUp,
  purple: Info,
};

const iconColorMap = {
  green: 'text-emerald-400/70',
  amber: 'text-amber-300/70',
  red: 'text-rose-300/70',
  blue: 'text-amber-300/70',
  purple: 'text-muted-foreground/60',
};

export const AnalystInsightCard: React.FC<AnalystInsightCardProps> = ({
  title,
  description,
  dotColor = 'purple',
  onExplore,
}) => {
  const Icon = iconMap[dotColor];

  return (
    <div
      className={cn(
        'glass-card p-4 flex items-start gap-3.5',
        onExplore && 'glass-card-hover cursor-pointer'
      )}
      onClick={onExplore}
    >
      <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
        <Icon className={cn('w-4.5 h-4.5', iconColorMap[dotColor])} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-xs font-medium text-foreground/80 leading-relaxed">{title}</p>
        {description && (
          <p className="text-[10px] text-muted-foreground/50 mt-1 line-clamp-2">{description}</p>
        )}
      </div>
      {onExplore && (
        <ArrowRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0 mt-2.5" />
      )}
    </div>
  );
};
