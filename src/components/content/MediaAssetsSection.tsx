import React, { useState } from 'react';
import { Image, Video, Download, Trash2, RefreshCw, Maximize2, X, Film, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VideoPlaceholder } from './VideoPlaceholder';

export interface MediaAsset {
  id: string;
  url: string;
  type: 'image' | 'video';
  prompt?: string;
  alt?: string;
  createdAt?: string;
}

interface MediaAssetsSectionProps {
  images?: MediaAsset[];
  videos?: MediaAsset[];
  isCollapsible?: boolean;
  defaultOpen?: boolean;
  showVideoPlaceholder?: boolean;
  showEmptyState?: boolean;
  onDelete?: (asset: MediaAsset) => void;
  onRegenerate?: (asset: MediaAsset) => void;
  onDownload?: (asset: MediaAsset) => void;
  onGenerateImage?: () => void;
  className?: string;
  compact?: boolean;
  title?: string;
}

export const MediaAssetsSection: React.FC<MediaAssetsSectionProps> = ({
  images = [],
  videos = [],
  isCollapsible = true,
  defaultOpen = true,
  showVideoPlaceholder = true,
  showEmptyState = true,
  onDelete,
  onRegenerate,
  onDownload,
  onGenerateImage,
  className,
  compact = false,
  title = "Media Assets"
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [lightboxImage, setLightboxImage] = useState<MediaAsset | null>(null);

  const totalImages = images.length;
  const totalVideos = videos.length;
  const hasMedia = totalImages > 0 || totalVideos > 0;

  const handleDownload = (asset: MediaAsset) => {
    if (onDownload) {
      onDownload(asset);
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = asset.url;
      link.download = `${asset.type}-${asset.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderImageGrid = () => (
    <div className={cn(
      "grid gap-3",
      compact ? "grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
    )}>
      {images.map((image) => (
        <div 
          key={image.id}
          className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted/30 hover:border-primary/50 transition-all"
        >
          <img 
            src={image.url} 
            alt={image.alt || image.prompt || 'Generated image'}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setLightboxImage(image)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => handleDownload(image)}
            >
              <Download className="h-4 w-4" />
            </Button>
            {onRegenerate && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => onRegenerate(image)}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-red-500/80"
                onClick={() => onDelete(image)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Image type badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-black/50 text-white text-xs">
              <Image className="h-3 w-3 mr-1" />
              Image
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Image className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mb-3">No images generated yet</p>
      {onGenerateImage && (
        <Button variant="outline" size="sm" onClick={onGenerateImage}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Images
        </Button>
      )}
    </div>
  );

  const content = (
    <div className="space-y-4">
      {/* Summary badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {totalImages > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Image className="h-3 w-3" />
            {totalImages} {totalImages === 1 ? 'Image' : 'Images'}
          </Badge>
        )}
        {totalVideos > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Video className="h-3 w-3" />
            {totalVideos} {totalVideos === 1 ? 'Video' : 'Videos'}
          </Badge>
        )}
        {showVideoPlaceholder && totalVideos === 0 && (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Film className="h-3 w-3" />
            Video Coming Soon
          </Badge>
        )}
      </div>

      {/* Images Grid */}
      {totalImages > 0 && renderImageGrid()}

      {/* Empty State */}
      {!hasMedia && showEmptyState && renderEmptyState()}

      {/* Video Placeholder */}
      {showVideoPlaceholder && (
        <VideoPlaceholder 
          compact={compact}
          videoCount={totalVideos}
        />
      )}
    </div>
  );

  if (!isCollapsible) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Image className="h-4 w-4 text-primary" />
            {title}
          </h4>
        </div>
        {content}
        
        {/* Lightbox */}
        <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            {lightboxImage && (
              <div className="relative">
                <img 
                  src={lightboxImage.url} 
                  alt={lightboxImage.alt || 'Generated image'}
                  className="w-full h-auto"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                  onClick={() => setLightboxImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                {lightboxImage.prompt && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                    <p className="text-white text-sm">{lightboxImage.prompt}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">{title}</span>
            {hasMedia && (
              <Badge variant="secondary" className="text-xs">
                {totalImages + totalVideos}
              </Badge>
            )}
          </div>
          <div className={cn(
            "h-4 w-4 transition-transform text-muted-foreground",
            isOpen ? "rotate-180" : ""
          )}>
            ▼
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4">
        {content}
      </CollapsibleContent>

      {/* Lightbox */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {lightboxImage && (
            <div className="relative">
              <img 
                src={lightboxImage.url} 
                alt={lightboxImage.alt || 'Generated image'}
                className="w-full h-auto"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setLightboxImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              {lightboxImage.prompt && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                  <p className="text-white text-sm">{lightboxImage.prompt}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
};
