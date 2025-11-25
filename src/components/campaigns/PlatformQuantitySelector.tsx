import React from 'react';
import { FileText, Share2, Mail, Video, Globe, Image, Layers, Laugh, Target } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Platform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultCount: number;
}

const PLATFORMS: Platform[] = [
  { id: 'blog', name: 'Blog Posts', icon: FileText, defaultCount: 0 },
  { id: 'social-linkedin', name: 'LinkedIn', icon: Share2, defaultCount: 0 },
  { id: 'social-twitter', name: 'Twitter', icon: Share2, defaultCount: 0 },
  { id: 'social-facebook', name: 'Facebook', icon: Share2, defaultCount: 0 },
  { id: 'social-instagram', name: 'Instagram', icon: Image, defaultCount: 0 },
  { id: 'email', name: 'Email', icon: Mail, defaultCount: 0 },
  { id: 'script', name: 'Video Script', icon: Video, defaultCount: 0 },
  { id: 'landing-page', name: 'Landing Page', icon: Globe, defaultCount: 0 },
  { id: 'carousel', name: 'Carousel', icon: Layers, defaultCount: 0 },
  { id: 'meme', name: 'Meme', icon: Laugh, defaultCount: 0 },
  { id: 'google-ads', name: 'Google Ads', icon: Target, defaultCount: 0 },
];

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
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
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
                    flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md text-xs
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-primary/10 border border-primary/30 text-primary hover:bg-primary/15' 
                      : 'bg-muted/30 border border-border/30 text-muted-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {isActive && (
                    <span className="font-semibold">{count}</span>
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
