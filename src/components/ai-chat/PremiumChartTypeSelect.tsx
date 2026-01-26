import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  LineChart, 
  TrendingUp, 
  PieChart, 
  Target, 
  Filter, 
  Hexagon, 
  Circle, 
  Layers,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'funnel' | 'scatter' | 'radial' | 'composed';

interface ChartTypeOption {
  value: ChartType;
  label: string;
  icon: LucideIcon;
  description: string;
  category: 'common' | 'advanced';
}

const chartTypeOptions: ChartTypeOption[] = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3, description: 'Compare values across categories', category: 'common' },
  { value: 'line', label: 'Line Chart', icon: LineChart, description: 'Show trends over time', category: 'common' },
  { value: 'area', label: 'Area Chart', icon: TrendingUp, description: 'Visualize volume changes', category: 'common' },
  { value: 'pie', label: 'Pie Chart', icon: PieChart, description: 'Show proportions of a whole', category: 'common' },
  { value: 'radar', label: 'Radar Chart', icon: Target, description: 'Multi-dimensional comparisons', category: 'advanced' },
  { value: 'funnel', label: 'Funnel Chart', icon: Filter, description: 'Visualize conversion stages', category: 'advanced' },
  { value: 'scatter', label: 'Scatter Plot', icon: Hexagon, description: 'Show data point distributions', category: 'advanced' },
  { value: 'radial', label: 'Radial Bar', icon: Circle, description: 'Circular progress display', category: 'advanced' },
  { value: 'composed', label: 'Mixed Chart', icon: Layers, description: 'Combine multiple chart types', category: 'advanced' },
];

interface PremiumChartTypeSelectProps {
  value: ChartType;
  onChange: (type: ChartType) => void;
  className?: string;
}

export const PremiumChartTypeSelect: React.FC<PremiumChartTypeSelectProps> = ({
  value,
  onChange,
  className
}) => {
  const selectedOption = chartTypeOptions.find(opt => opt.value === value) || chartTypeOptions[0];
  const Icon = selectedOption.icon;

  return (
    <Select value={value} onValueChange={(v) => onChange(v as ChartType)}>
      <SelectTrigger 
        className={cn(
          "h-9 w-[180px] gap-2",
          "bg-muted/30 border-border/50",
          "hover:bg-muted/50 hover:border-border",
          "focus:ring-1 focus:ring-primary/30",
          "transition-all duration-200",
          className
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
            <Icon className="w-3.5 h-3.5 text-primary" />
          </div>
          <SelectValue placeholder="Chart type">
            <span className="truncate text-sm">{selectedOption.label}</span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent 
        className="w-[260px] bg-popover/95 backdrop-blur-xl border-border/50"
        align="end"
      >
        {/* Common Charts */}
        <div className="px-2 py-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Common
          </span>
        </div>
        {chartTypeOptions
          .filter(opt => opt.category === 'common')
          .map((option) => {
            const OptionIcon = option.icon;
            return (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3 py-0.5">
                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-lg",
                    value === option.value 
                      ? "bg-primary/20 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    <OptionIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </div>
              </SelectItem>
            );
          })}

        {/* Separator */}
        <div className="my-1 mx-2 h-px bg-border/50" />

        {/* Advanced Charts */}
        <div className="px-2 py-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Advanced
          </span>
        </div>
        {chartTypeOptions
          .filter(opt => opt.category === 'advanced')
          .map((option) => {
            const OptionIcon = option.icon;
            return (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3 py-0.5">
                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-lg",
                    value === option.value 
                      ? "bg-primary/20 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    <OptionIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
      </SelectContent>
    </Select>
  );
};
