import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, AlertTriangle, Sparkles, TrendingUp, Info } from 'lucide-react';

interface AnalystInsightCardProps {
  title: string;
  description?: string;
  dotColor?: 'green' | 'amber' | 'red' | 'blue' | 'purple';
  urgency?: 'critical' | 'high' | 'medium' | 'low';
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
  green: 'text-primary/70',
  amber: 'text-primary/60',
  red: 'text-primary/50',
  blue: 'text-primary/60',
  purple: 'text-muted-foreground/60',
};

export const AnalystInsightCard: React.FC<AnalystInsightCardProps> = ({
  title,
  description,
  dotColor = 'purple',
  urgency,
  onExplore,
}) => {
  const Icon = iconMap[dotColor];

  return (
    <div
      className={cn(
        'glass-card p-3 flex items-start gap-3',
        onExplore && 'glass-card-hover cursor-pointer'
      )}
      onClick={onExplore}
    >
      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
        <Icon className={cn('w-4 h-4', iconColorMap[dotColor])} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium text-foreground/80 leading-relaxed flex-1">{title}</p>
          {urgency === 'critical' && (
            <span className="text-[8px] font-bold text-rose-400 uppercase tracking-wider flex-shrink-0">Urgent</span>
          )}
          {urgency === 'high' && (
            <span className="text-[8px] font-bold text-primary uppercase tracking-wider flex-shrink-0">High</span>
          )}
        </div>
        {description && (
          <p className="text-[10px] text-muted-foreground/50 mt-1 line-clamp-2">{description}</p>
        )}
      </div>
      {onExplore && (
        <ArrowRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0 mt-1.5" />
      )}
    </div>
  );
};
