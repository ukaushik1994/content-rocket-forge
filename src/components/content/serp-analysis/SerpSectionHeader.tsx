
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type SectionVariant = "blue" | "green" | "purple" | "amber" | "indigo" | "teal" | "rose";

export interface SerpSectionHeaderProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  variant?: SectionVariant;
  description?: string;
  count?: number;
}

export function SerpSectionHeader({ 
  title, 
  expanded, 
  onToggle, 
  variant = "purple",
  description,
  count
}: SerpSectionHeaderProps) {
  // Determine variant classes
  const variantClasses = {
    purple: "from-purple-900/10 to-purple-800/5 border-purple-500/20 hover:bg-purple-900/10",
    blue: "from-blue-900/10 to-blue-800/5 border-blue-500/20 hover:bg-blue-900/10",
    green: "from-green-900/10 to-green-800/5 border-green-500/20 hover:bg-green-900/10",
    amber: "from-amber-900/10 to-amber-800/5 border-amber-500/20 hover:bg-amber-900/10",
    indigo: "from-indigo-900/10 to-indigo-800/5 border-indigo-500/20 hover:bg-indigo-900/10",
    teal: "from-teal-900/10 to-teal-800/5 border-teal-500/20 hover:bg-teal-900/10",
    rose: "from-rose-900/10 to-rose-800/5 border-rose-500/20 hover:bg-rose-900/10"
  };
  
  // Icon color classes
  const iconColorClasses = {
    purple: "text-purple-400",
    blue: "text-blue-400",
    green: "text-green-400",
    amber: "text-amber-400",
    indigo: "text-indigo-400",
    teal: "text-teal-400",
    rose: "text-rose-400"
  };
  
  return (
    <div 
      className={cn(
        "flex justify-between items-center p-3 rounded-lg cursor-pointer border bg-gradient-to-br transition-all",
        variantClasses[variant]
      )}
      onClick={onToggle}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{title}</h3>
          {count !== undefined && (
            <div className={`px-2 py-0.5 text-xs rounded-full bg-white/10 ${iconColorClasses[variant]}`}>
              {count}
            </div>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className={cn("h-6 w-6 flex items-center justify-center rounded-full transition-colors", iconColorClasses[variant])}>
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </div>
  );
}
