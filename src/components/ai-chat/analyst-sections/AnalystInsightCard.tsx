import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface AnalystInsightCardProps {
  title: string;
  description?: string;
  dotColor?: 'green' | 'amber' | 'red' | 'blue' | 'purple';
  onExplore?: () => void;
}

const dotColorMap = {
  green: 'bg-emerald-400',
  amber: 'bg-amber-400',
  red: 'bg-red-400',
  blue: 'bg-blue-400',
  purple: 'bg-primary',
};

export const AnalystInsightCard: React.FC<AnalystInsightCardProps> = ({
  title,
  description,
  dotColor = 'purple',
  onExplore,
}) => {
  return (
    <div
      className={cn(
        'glass-card p-3 flex items-start gap-3',
        onExplore && 'glass-card-hover cursor-pointer'
      )}
      onClick={onExplore}
    >
      <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', dotColorMap[dotColor])} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground/80 leading-relaxed">{title}</p>
        {description && (
          <p className="text-[10px] text-muted-foreground/60 mt-1 line-clamp-2">{description}</p>
        )}
      </div>
      {onExplore && (
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
      )}
    </div>
  );
};
