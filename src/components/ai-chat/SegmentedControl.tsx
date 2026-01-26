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
  size?: 'sm' | 'md';
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className,
  size = 'sm'
}) => {
  const activeIndex = options.findIndex(opt => opt.value === value);

  return (
    <TooltipProvider delayDuration={300}>
      <div 
        className={cn(
          "relative flex items-center rounded-lg",
          "bg-white/[0.04] backdrop-blur-sm",
          "border border-white/8",
          size === 'sm' ? 'p-0.5' : 'p-1',
          className
        )}
      >
        {/* Sliding background indicator */}
        <motion.div
          className={cn(
            "absolute rounded-md",
            "bg-white/10",
            "shadow-sm shadow-black/10",
            size === 'sm' ? 'top-0.5 bottom-0.5' : 'top-1 bottom-1'
          )}
          initial={false}
          animate={{
            left: `calc(${activeIndex * (100 / options.length)}% + ${size === 'sm' ? '2px' : '4px'})`,
            width: `calc(${100 / options.length}% - ${size === 'sm' ? '4px' : '8px'})`
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
                "relative z-10 flex items-center justify-center gap-1.5",
                "text-xs font-medium rounded-md transition-colors duration-200",
                "flex-1 min-w-0",
                size === 'sm' ? 'px-2.5 py-1.5' : 'px-3 py-2',
                isActive 
                  ? "text-foreground" 
                  : "text-foreground/50 hover:text-foreground/70"
              )}
            >
              {Icon && <Icon className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />}
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
