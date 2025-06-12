
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: keyof typeof LucideIcons;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
  loading?: boolean;
}

export function EnhancedStatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  className,
  loading = false 
}: EnhancedStatCardProps) {
  const IconComponent = icon && (LucideIcons[icon] as LucideIcon | undefined);
  
  if (loading) {
    return (
      <Card className={cn("overflow-hidden glass-panel bg-glass", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn("overflow-hidden glass-panel bg-glass group hover:shadow-neon transition-all duration-300", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200">
          {title}
        </CardTitle>
        {IconComponent && <IconComponent className="w-4 h-4 text-primary" />}
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold group-hover:text-gradient transition-all duration-300">
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center mt-1 flex-wrap">
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
