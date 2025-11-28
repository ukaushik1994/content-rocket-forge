import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PLATFORM_ICONS, getPlatformConfig } from '@/utils/platformIcons';

const PLATFORMS = Object.values(PLATFORM_ICONS).map(config => ({
  ...config,
  defaultCount: 0
}));

interface PlatformQuantitySelectorProps {
  preferences: Record<string, number>;
  onChange: (preferences: Record<string, number>) => void;
}

export function PlatformQuantitySelector({ preferences, onChange }: PlatformQuantitySelectorProps) {
  const handleChipClick = (platformId: string) => {
    const currentCount = preferences[platformId] || 0;
    // Cycle through 0 → 1 → 2 → 3 → ... → 10 → 0
    const newCount = currentCount >= 10 ? 0 : currentCount + 1;
    onChange({
      ...preferences,
      [platformId]: newCount,
    });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const count = preferences[platform.id] || 0;
          const isActive = count > 0;

          return (
            <Tooltip key={platform.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleChipClick(platform.id)}
                  className={`
                    flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-primary/15 text-primary shadow-sm shadow-primary/20' 
                      : 'text-muted-foreground/50 opacity-60 hover:opacity-100 hover:text-muted-foreground'
                    }
                  `}
                >
                  {Icon ? (
                    <Icon className={`${isActive ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
                  ) : platform.label ? (
                    <span className={`font-semibold ${isActive ? 'text-xs' : 'text-[10px]'} ${platform.color}`}>
                      {platform.label}
                    </span>
                  ) : null}
                  {isActive && (
                    <span className="font-bold text-xs">{count}</span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {platform.name}{count > 0 && `: ${count} ${count === 1 ? 'piece' : 'pieces'}`}
                {count === 0 && ' (AI decides)'}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
