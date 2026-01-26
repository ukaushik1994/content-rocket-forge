import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';

interface SegmentOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  tooltip?: string;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className
}) => {
  const activeIndex = options.findIndex(opt => opt.value === value);

  return (
    <TooltipProvider delayDuration={300}>
      <div 
        className={cn(
          "relative flex items-center p-1 rounded-xl",
          "bg-muted/50 border border-border/50",
          "shadow-inner shadow-black/5",
          className
        )}
      >
        {/* Sliding background indicator */}
        <motion.div
          className={cn(
            "absolute top-1 bottom-1 rounded-lg",
            "bg-background shadow-sm",
            "border border-border/30"
          )}
          initial={false}
          animate={{
            left: `calc(${activeIndex * (100 / options.length)}% + 4px)`,
            width: `calc(${100 / options.length}% - 8px)`
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />

        {options.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === value;

          const button = (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5",
                "text-sm font-medium rounded-lg transition-colors duration-200",
                "flex-1 min-w-0",
                isActive 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span className="truncate">{option.label}</span>
            </button>
          );

          if (option.tooltip) {
            return (
              <Tooltip key={option.value}>
                <TooltipTrigger asChild>
                  {button}
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {option.tooltip}
                </TooltipContent>
              </Tooltip>
            );
          }

          return button;
        })}
      </div>
    </TooltipProvider>
  );
};
