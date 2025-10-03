import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartTypeSwitcherProps {
  value: 'line' | 'bar' | 'area' | 'pie';
  onChange: (type: 'line' | 'bar' | 'area' | 'pie') => void;
}

export const ChartTypeSwitcher: React.FC<ChartTypeSwitcherProps> = ({ value, onChange }) => {
  const types = [
    { value: 'bar', icon: BarChart3, label: 'Bar' },
    { value: 'line', icon: LineChart, label: 'Line' },
    { value: 'area', icon: TrendingUp, label: 'Area' },
    { value: 'pie', icon: PieChart, label: 'Pie' }
  ] as const;

  return (
    <div className="flex gap-1 p-1 bg-background/30 rounded-lg border border-white/10">
      {types.map((type) => {
        const Icon = type.icon;
        return (
          <Button
            key={type.value}
            size="sm"
            variant={value === type.value ? 'default' : 'ghost'}
            onClick={() => onChange(type.value)}
            className={cn(
              "h-7 w-7 p-0 transition-all duration-200",
              value === type.value && "bg-primary text-primary-foreground"
            )}
            title={type.label}
          >
            <Icon className="w-3.5 h-3.5" />
          </Button>
        );
      })}
    </div>
  );
};
