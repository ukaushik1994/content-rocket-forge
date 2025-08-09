import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-xl',
        'ring-1 ring-black/5 dark:ring-white/5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
