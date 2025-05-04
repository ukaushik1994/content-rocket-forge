
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: keyof typeof LucideIcons;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
  // Get the icon component if it exists
  let IconComponent: LucideIcon | null = null;
  if (icon && icon in LucideIcons) {
    IconComponent = LucideIcons[icon] as LucideIcon;
  }
  
  return (
    <Card className={cn("overflow-hidden glass-panel bg-glass group", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200">{title}</CardTitle>
        {IconComponent && <IconComponent className="w-4 h-4 text-primary" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold group-hover:text-gradient transition-all duration-300">{value}</div>
        {(description || trend) && (
          <div className="flex items-center mt-1">
            {trend && (
              <span 
                className={cn(
                  "text-xs font-medium mr-2 flex items-center gap-1", 
                  trend.positive ? "text-green-400" : "text-red-400"
                )}
              >
                {trend.positive ? (
                  <LucideIcons.TrendingUp className="h-3 w-3" />
                ) : (
                  <LucideIcons.TrendingDown className="h-3 w-3" />
                )}
                {trend.positive ? "+" : "-"}{trend.value}%
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
