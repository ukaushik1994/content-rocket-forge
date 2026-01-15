import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Image, 
  Plus, 
  Download, 
  Copy, 
  Trash2, 
  ArrowUpFromLine,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ImageOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface AttachedImage {
  id: string;
  url: string;
  prompt: string;
  provider?: string;
  createdAt?: string;
}

interface AttachedImagesGalleryProps {
  images: AttachedImage[];
  onGenerateMore?: () => void;
  onInsertIntoContent?: (image: AttachedImage) => void;
  onDelete?: (image: AttachedImage) => void;
  isGenerating?: boolean;
  className?: string;
  title?: string;
  compact?: boolean;
}

export const AttachedImagesGallery: React.FC<AttachedImagesGalleryProps> = ({
  images,
  onGenerateMore,
  onInsertIntoContent,
  onDelete,
  isGenerating = false,
  className,
  title = "Generated Images",
  compact = false
}) => {
  const [selectedImage, setSelectedImage] = useState<AttachedImage | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  const handleCopyUrl = async (image: AttachedImage) => {
    try {
      await navigator.clipboard.writeText(image.url);
      toast.success('Image URL copied to clipboard');
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const handleDownload = (image: AttachedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `generated-image-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image download started');
  };

  const openPreview = (image: AttachedImage, index: number) => {
    setSelectedImage(image);
    setPreviewIndex(index);
  };

  const navigatePreview = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (previewIndex - 1 + images.length) % images.length
      : (previewIndex + 1) % images.length;
    setPreviewIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  if (images.length === 0 && !onGenerateMore) {
    return null;
  }

  return (
    <>
      <Card className={cn("border-border/50", className)}>
        <CardHeader className={cn("pb-2", compact && "py-3 px-4")}>
          <div className="flex items-center justify-between">
            <CardTitle className={cn("flex items-center gap-2", compact ? "text-sm" : "text-base")}>
              <Image className="h-4 w-4 text-primary" />
              {title}
              {images.length > 0 && (
                <span className="text-xs text-muted-foreground font-normal">
                  ({images.length})
                </span>
              )}
            </CardTitle>
            {onGenerateMore && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onGenerateMore}
                disabled={isGenerating}
                className="gap-1"
              >
                {isGenerating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
                {isGenerating ? 'Generating...' : 'Generate More'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className={cn(compact && "px-4 pb-3")}>
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <ImageOff className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">No images generated yet</p>
              <p className="text-xs text-muted-foreground/70">
                Images will appear here when generated
              </p>
            </div>
          ) : (
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-3 pb-2">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative flex-shrink-0 cursor-pointer"
                    onClick={() => openPreview(image, index)}
                  >
                    <div className={cn(
                      "relative rounded-lg overflow-hidden border border-border/50",
                      compact ? "h-20 w-20" : "h-28 w-28"
                    )}>
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Preview</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isGenerating && (
                  <div className={cn(
                    "flex-shrink-0 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 flex items-center justify-center",
                    compact ? "h-20 w-20" : "h-28 w-28"
                  )}>
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Image Preview</span>
              <span className="text-sm text-muted-foreground font-normal">
                {previewIndex + 1} / {images.length}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative">
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={(e) => { e.stopPropagation(); navigatePreview('prev'); }}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={(e) => { e.stopPropagation(); navigatePreview('next'); }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Prompt:</span> {selectedImage.prompt}
                </p>
                {selectedImage.provider && (
                  <p className="text-xs text-muted-foreground">
                    Generated with {selectedImage.provider}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {onInsertIntoContent && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      onInsertIntoContent(selectedImage);
                      setSelectedImage(null);
                    }}
                    className="gap-1"
                  >
                    <ArrowUpFromLine className="h-3 w-3" />
                    Insert into Content
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(selectedImage)}
                  className="gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(selectedImage)}
                  className="gap-1"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      onDelete(selectedImage);
                      setSelectedImage(null);
                    }}
                    className="gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
