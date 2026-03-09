import React from 'react';
import { Video, Film, Sparkles, Play, Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface VideoPlaceholderProps {
  compact?: boolean;
  videoCount?: number;
  showNotifyButton?: boolean;
  onNotify?: () => void;
  className?: string;
  variant?: 'default' | 'inline' | 'card';
  title?: string;
  description?: string;
}

export const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({
  compact = false,
  videoCount = 0,
  showNotifyButton = false,
  onNotify,
  className,
  variant = 'default',
  title = "Video Generation",
  description = "AI-powered video creation is coming soon"
}) => {
  // If there are existing videos, don't show placeholder
  if (videoCount > 0) {
    return null;
  }

  if (variant === 'inline') {
    return (
      <div className={cn(
        "flex items-center gap-2 text-muted-foreground",
        className
      )}>
        <Film className="h-4 w-4" />
        <span className="text-xs">Video coming soon</span>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          <Clock className="h-2.5 w-2.5 mr-1" />
          Soon
        </Badge>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg border border-dashed border-border bg-muted/20",
        className
      )}>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Video className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">Video Generation</p>
            <p className="text-[10px] text-muted-foreground">Coming Soon</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          <Sparkles className="h-2.5 w-2.5 mr-1" />
          Beta
        </Badge>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Animated icon container */}
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <Film className="h-6 w-6 text-primary" />
                </div>
              </div>
              {/* Decorative play button */}
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center">
                <Play className="h-3 w-3 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h4 className="font-semibold text-foreground">{title}</h4>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Coming Soon
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                {description}
              </p>
            </div>

            {/* Feature preview */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {['Promo Videos', 'Social Clips', 'Explainers'].map((feature) => (
                <Badge key={feature} variant="outline" className="text-xs text-muted-foreground">
                  {feature}
                </Badge>
              ))}
            </div>

            {showNotifyButton && onNotify && (
              <Button variant="outline" size="sm" onClick={onNotify} className="mt-2">
                <Bell className="h-4 w-4 mr-2" />
                Notify Me
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <div className={cn(
      "rounded-lg border border-dashed border-border bg-gradient-to-br from-muted/50 to-muted/20 p-4",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
          <Video className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-foreground">{title}</h4>
            <Badge variant="secondary" className="text-[10px]">
              <Sparkles className="h-2.5 w-2.5 mr-1" />
              Coming Soon
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {['Promotional', 'Educational', 'Social Media'].map((type) => (
              <Badge 
                key={type} 
                variant="outline" 
                className="text-[10px] text-muted-foreground bg-background/50"
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {showNotifyButton && onNotify && (
        <div className="mt-3 pt-3 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onNotify} className="w-full">
            <Bell className="h-4 w-4 mr-2" />
            Get Notified When Available
          </Button>
        </div>
      )}
    </div>
  );
};

// Mini indicator for cards/list items
interface VideoComingSoonBadgeProps {
  className?: string;
}

export const VideoComingSoonBadge: React.FC<VideoComingSoonBadgeProps> = ({ className }) => {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[10px] text-muted-foreground gap-1 bg-muted/30",
        className
      )}
    >
      <Film className="h-2.5 w-2.5" />
      Video Soon
    </Badge>
  );
};
