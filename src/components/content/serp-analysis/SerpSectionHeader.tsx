
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SerpSectionHeaderProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  variant?: 'blue' | 'green' | 'amber' | 'indigo' | 'teal' | 'rose' | 'purple';
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
  // Define variant colors
  const variantColors = {
    blue: "text-blue-400 hover:text-blue-300",
    green: "text-green-400 hover:text-green-300",
    amber: "text-amber-400 hover:text-amber-300",
    indigo: "text-indigo-400 hover:text-indigo-300",
    teal: "text-teal-400 hover:text-teal-300",
    rose: "text-rose-400 hover:text-rose-300",
    purple: "text-purple-400 hover:text-purple-300",
  };
  
  const bgVariantColors = {
    blue: "bg-blue-500/10",
    green: "bg-green-500/10",
    amber: "bg-amber-500/10",
    indigo: "bg-indigo-500/10",
    teal: "bg-teal-500/10",
    rose: "bg-rose-500/10",
    purple: "bg-purple-500/10",
  };
  
  return (
    <div className="flex flex-col">
      <Button
        variant="ghost"
        onClick={onToggle}
        className={`justify-between h-auto py-2 px-3 text-left ${variantColors[variant]} hover:bg-transparent group`}
      >
        <div className="flex items-center gap-2">
          <span className={`text-base font-medium`}>{title}</span>
          {count !== undefined && count > 0 && (
            <span className={`text-xs font-medium ${bgVariantColors[variant]} px-2 py-0.5 rounded-full`}>
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center">
          {description && (
            <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">
              {description}
            </span>
          )}
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </Button>
    </div>
  );
}
