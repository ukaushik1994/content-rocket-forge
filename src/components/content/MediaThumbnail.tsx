import React, { useState } from 'react';
import { Image, Video, Play, ImageOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MediaThumbnailProps {
  src?: string;
  alt?: string;
  type?: 'image' | 'video';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showTypeIcon?: boolean;
  showHoverPreview?: boolean;
  onClick?: () => void;
  fallback?: React.ReactNode;
}

const sizeClasses = {
  xs: 'h-8 w-8',
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-24 w-24'
};

const iconSizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
};

export const MediaThumbnail: React.FC<MediaThumbnailProps> = ({
  src,
  alt = 'Media thumbnail',
  type = 'image',
  size = 'md',
  className,
  showTypeIcon = true,
  showHoverPreview = true,
  onClick,
  fallback
}) => {
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const renderFallback = () => {
    if (fallback) return fallback;
    
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted rounded-md",
        sizeClasses[size]
      )}>
        <ImageOff className={cn("text-muted-foreground", iconSizeClasses[size])} />
      </div>
    );
  };

  if (!src || hasError) {
    return renderFallback();
  }

  const thumbnail = (
    <div 
      className={cn(
        "relative rounded-md overflow-hidden border border-border bg-muted/30 transition-all",
        sizeClasses[size],
        onClick && "cursor-pointer hover:border-primary/50 hover:shadow-md",
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {type === 'image' ? (
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Play className={cn("text-primary", iconSizeClasses[size])} />
        </div>
      )}

      {/* Type indicator */}
      {showTypeIcon && (
        <div className="absolute bottom-0.5 right-0.5">
          <Badge 
            variant="secondary" 
            className="h-4 px-1 text-[10px] bg-black/60 text-white border-0"
          >
            {type === 'image' ? (
              <Image className="h-2.5 w-2.5" />
            ) : (
              <Video className="h-2.5 w-2.5" />
            )}
          </Badge>
        </div>
      )}

      {/* Hover overlay for video */}
      {type === 'video' && isHovered && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <Play className="h-6 w-6 text-white" />
        </div>
      )}
    </div>
  );

  if (showHoverPreview && type === 'image') {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {thumbnail}
          </TooltipTrigger>
          <TooltipContent side="right" className="p-0 overflow-hidden max-w-xs">
            <img 
              src={src} 
              alt={alt}
              className="w-full h-auto max-h-48 object-contain"
            />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return thumbnail;
};

// Badge variant for showing media count on cards
interface MediaCountBadgeProps {
  imageCount?: number;
  videoCount?: number;
  className?: string;
  variant?: 'default' | 'compact';
}

export const MediaCountBadge: React.FC<MediaCountBadgeProps> = ({
  imageCount = 0,
  videoCount = 0,
  className,
  variant = 'default'
}) => {
  if (imageCount === 0 && videoCount === 0) return null;

  if (variant === 'compact') {
    return (
      <Badge variant="secondary" className={cn("gap-1 text-xs", className)}>
        {imageCount > 0 && (
          <>
            <Image className="h-3 w-3" />
            {imageCount}
          </>
        )}
        {imageCount > 0 && videoCount > 0 && <span className="mx-0.5">·</span>}
        {videoCount > 0 && (
          <>
            <Video className="h-3 w-3" />
            {videoCount}
          </>
        )}
      </Badge>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {imageCount > 0 && (
        <Badge variant="secondary" className="gap-1 text-xs">
          <Image className="h-3 w-3" />
          {imageCount}
        </Badge>
      )}
      {videoCount > 0 && (
        <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
          <Video className="h-3 w-3" />
          {videoCount}
        </Badge>
      )}
    </div>
  );
};

// Grid of thumbnails for card previews
interface MediaThumbnailGridProps {
  images: Array<{ id: string; url: string; alt?: string }>;
  maxDisplay?: number;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  onImageClick?: (image: { id: string; url: string }) => void;
}

export const MediaThumbnailGrid: React.FC<MediaThumbnailGridProps> = ({
  images,
  maxDisplay = 4,
  size = 'sm',
  className,
  onImageClick
}) => {
  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  if (images.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {displayImages.map((image) => (
        <MediaThumbnail
          key={image.id}
          src={image.url}
          alt={image.alt}
          size={size}
          showTypeIcon={false}
          showHoverPreview={true}
          onClick={() => onImageClick?.(image)}
        />
      ))}
      {remainingCount > 0 && (
        <div className={cn(
          "flex items-center justify-center bg-muted rounded-md text-muted-foreground text-xs font-medium",
          sizeClasses[size]
        )}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
