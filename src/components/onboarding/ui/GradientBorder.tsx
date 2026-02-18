import React from 'react';
import { cn } from '@/lib/utils';

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
}

export const GradientBorder: React.FC<GradientBorderProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("relative", className)}>
      <div className="relative rounded-3xl bg-background/90 backdrop-blur-md border border-border/10">
        {children}
      </div>
    </div>
  );
};
