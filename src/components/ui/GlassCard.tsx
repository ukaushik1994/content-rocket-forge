import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl shadow-2xl',
        'ring-1 ring-white/5',
        'relative overflow-hidden',
        // Enhanced shadow and glow effects
        'before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-white/5 before:-z-10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
