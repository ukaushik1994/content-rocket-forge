
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SerpSectionHeaderProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  variant?: 'blue' | 'purple' | 'green' | 'amber' | 'indigo' | 'rose' | 'teal';
  description?: string;
  count?: number;
}

export function SerpSectionHeader({ 
  title, 
  expanded, 
  onToggle, 
  variant = 'blue',
  description,
  count
}: SerpSectionHeaderProps) {
  const variantStyles = {
    blue: 'from-blue-500/10 to-blue-700/5 border-blue-500/20',
    purple: 'from-purple-500/10 to-purple-700/5 border-purple-500/20',
    green: 'from-green-500/10 to-green-700/5 border-green-500/20',
    amber: 'from-amber-500/10 to-amber-700/5 border-amber-500/20',
    indigo: 'from-indigo-500/10 to-indigo-700/5 border-indigo-500/20',
    rose: 'from-rose-500/10 to-rose-700/5 border-rose-500/20',
    teal: 'from-teal-500/10 to-teal-700/5 border-teal-500/20',
  };
  
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-md bg-gradient-to-r border",
        variantStyles[variant]
      )}
    >
      <div className="flex flex-col items-start">
        <div className="flex items-center">
          <h3 className="text-base font-medium">{title}</h3>
          {count !== undefined && count > 0 && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/10">
              {count}
            </span>
          )}
        </div>
        {description && (
          <span className="text-xs text-muted-foreground mt-1">{description}</span>
        )}
      </div>
      <div className="text-muted-foreground">
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </div>
    </button>
  );
}
