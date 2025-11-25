import React from 'react';
import { FileText, Share2, Mail, Video, Globe, Image, Layers, Laugh, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  { id: 'email', name: 'Email', icon: Mail, defaultCount: 0 },
  { id: 'script', name: 'Video Script', icon: Video, defaultCount: 0 },
  { id: 'landing-page', name: 'Landing Page', icon: Globe, defaultCount: 0 },
  { id: 'carousel', name: 'Carousel', icon: Layers, defaultCount: 0 },
  { id: 'meme', name: 'Meme', icon: Laugh, defaultCount: 0 },
];

interface PlatformQuantitySelectorProps {
  preferences: Record<string, number>;
  onChange: (preferences: Record<string, number>) => void;
}

export function PlatformQuantitySelector({ preferences, onChange }: PlatformQuantitySelectorProps) {
  const handleIncrement = (platformId: string) => {
    const current = preferences[platformId] || 0;
    onChange({ ...preferences, [platformId]: Math.min(current + 1, 20) });
  };

  const handleDecrement = (platformId: string) => {
    const current = preferences[platformId] || 0;
    if (current > 0) {
      onChange({ ...preferences, [platformId]: current - 1 });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Platform Content Quantity</h4>
        <span className="text-xs text-muted-foreground">0 = AI Decides</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const count = preferences[platform.id] || 0;
          const hasValue = count > 0;
          
          return (
            <div
              key={platform.id}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                "bg-background/60 backdrop-blur-sm",
                hasValue 
                  ? "border-primary/50 ring-1 ring-primary/20" 
                  : "border-border/50 hover:border-border"
              )}
            >
              <div className={cn(
                "p-2 rounded-full",
                hasValue ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              
              <span className="text-xs font-medium text-center">{platform.name}</span>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDecrement(platform.id)}
                  disabled={count === 0}
                  className="h-6 w-6 p-0"
                >
                  -
                </Button>
                
                <span className={cn(
                  "text-sm font-semibold min-w-[2ch] text-center",
                  hasValue ? "text-primary" : "text-muted-foreground"
                )}>
                  {count}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleIncrement(platform.id)}
                  disabled={count >= 20}
                  className="h-6 w-6 p-0"
                >
                  +
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground text-center mt-2">
        Set quantity to 0 to let AI determine optimal content mix for each platform
      </p>
    </div>
  );
}
