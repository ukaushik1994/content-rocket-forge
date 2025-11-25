import React from 'react';
import { FileText, Share2, Mail, Video, Globe, Image, Layers, Laugh, Target, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

  const totalSelected = Object.values(preferences).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-4">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Platform Content Quantity</h4>
            {totalSelected > 0 && (
              <p className="text-xs text-primary">{totalSelected} pieces selected</p>
            )}
          </div>
        </div>
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-xs text-muted-foreground">
          0 = AI Decides
        </div>
      </div>
      
      {/* Platform Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PLATFORMS.map((platform, index) => {
          const Icon = platform.icon;
          const count = preferences[platform.id] || 0;
          const hasValue = count > 0;
          
          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className={cn(
                "group relative flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-300",
                "bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm",
                hasValue 
                  ? "border-primary/40 ring-2 ring-primary/20 shadow-lg shadow-primary/10" 
                  : "border-border/30 hover:border-border/50 hover:shadow-md hover:scale-[1.02]"
              )}
            >
              {/* Icon Container */}
              <motion.div 
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300",
                  hasValue 
                    ? "bg-gradient-to-br from-primary/20 to-blue-500/20 ring-1 ring-primary/30 shadow-lg shadow-primary/20" 
                    : "bg-muted/50 group-hover:bg-muted/70"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  hasValue ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
              </motion.div>
              
              {/* Platform Name */}
              <span className={cn(
                "text-xs font-semibold text-center transition-colors",
                hasValue ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {platform.name}
              </span>
              
              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDecrement(platform.id)}
                  disabled={count === 0}
                  className={cn(
                    "h-7 w-7 p-0 rounded-lg transition-all",
                    hasValue 
                      ? "border-primary/30 hover:bg-primary/10 hover:border-primary/50" 
                      : "hover:bg-muted/70"
                  )}
                >
                  <span className={cn("text-sm font-bold", hasValue && "text-primary")}>−</span>
                </Button>
                
                <span className={cn(
                  "text-base font-bold min-w-[2.5ch] text-center transition-all",
                  hasValue 
                    ? "bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent scale-110" 
                    : "text-muted-foreground"
                )}>
                  {count}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleIncrement(platform.id)}
                  disabled={count >= 20}
                  className={cn(
                    "h-7 w-7 p-0 rounded-lg transition-all",
                    hasValue 
                      ? "border-primary/30 hover:bg-primary/10 hover:border-primary/50" 
                      : "hover:bg-muted/70"
                  )}
                >
                  <span className={cn("text-sm font-bold", hasValue && "text-primary")}>+</span>
                </Button>
              </div>

              {/* Active State Glow */}
              {hasValue && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-blue-500/5 pointer-events-none" />
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* Footer Hint */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Set quantity to 0 to let AI determine optimal content mix for each platform
        </p>
      </div>
    </div>
  );
}
