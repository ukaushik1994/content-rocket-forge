import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/30 bg-card/80 backdrop-blur-md',
        'shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
