import React from 'react';
import { cn } from '@/lib/utils';

interface SectionSeparatorProps {
  className?: string;
}

export const SectionSeparator: React.FC<SectionSeparatorProps> = ({ className }) => {
  return (
    <div className={cn("relative py-6", className)}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border/20" />
      </div>
      <div className="relative flex justify-center">
        <div className="bg-background px-6">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary/40 to-neon-blue/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
};