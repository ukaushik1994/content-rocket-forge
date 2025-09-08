import React from 'react';
import { cn } from '@/lib/utils';

interface SectionSeparatorProps {
  className?: string;
}

export const SectionSeparator: React.FC<SectionSeparatorProps> = ({ className }) => {
  return (
    <div className={cn("relative py-8", className)}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border/30" />
      </div>
      <div className="relative flex justify-center">
        <div className="bg-background px-4">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary/50 to-neon-blue/50 animate-pulse" />
        </div>
      </div>
    </div>
  );
};