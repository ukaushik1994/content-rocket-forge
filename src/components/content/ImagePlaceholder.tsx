import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, RefreshCw, X, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImageSlot {
  id: string;
  position: number;
  prompt: string;
  context: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
}

interface ImagePlaceholderProps {
  slot: ImageSlot;
  onGenerate?: (slot: ImageSlot) => void;
  onRegenerate?: (slot: ImageSlot) => void;
  onRemove?: (slot: ImageSlot) => void;
  className?: string;
  compact?: boolean;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  slot,
  onGenerate,
  onRegenerate,
  onRemove,
  className,
  compact = false
}) => {
  const isGenerating = slot.status === 'generating';
  const isCompleted = slot.status === 'completed' && slot.imageUrl;
  const isFailed = slot.status === 'failed';
  const isPending = slot.status === 'pending';

  if (isCompleted && slot.imageUrl) {
    return (
      <div className={cn("relative group rounded-lg overflow-hidden", className)}>
        <img 
          src={slot.imageUrl} 
          alt={slot.prompt}
          className="w-full h-auto object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {onRegenerate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRegenerate(slot)}
              className="gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Regenerate
            </Button>
          )}
          {onRemove && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(slot)}
              className="gap-1"
            >
              <X className="h-3 w-3" />
              Remove
            </Button>
          )}
        </div>
        <p className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate opacity-0 group-hover:opacity-100 transition-opacity">
          {slot.prompt}
        </p>
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        "border-2 border-dashed transition-colors",
        isPending && "border-muted-foreground/30 bg-muted/30",
        isGenerating && "border-primary/50 bg-primary/5",
        isFailed && "border-destructive/50 bg-destructive/5",
        compact ? "p-3" : "p-6",
        className
      )}
    >
      <div className={cn(
        "flex flex-col items-center justify-center text-center gap-3",
        compact ? "min-h-[80px]" : "min-h-[120px]"
      )}>
        {isGenerating ? (
          <>
            <div className="relative">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <Sparkles className="h-4 w-4 text-primary absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Generating image...</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{slot.prompt}</p>
            </div>
          </>
        ) : isFailed ? (
          <>
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="h-5 w-5 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">Generation failed</p>
              <p className="text-xs text-muted-foreground">{slot.error || 'Unknown error'}</p>
            </div>
            <div className="flex gap-2">
              {onRegenerate && (
                <Button variant="outline" size="sm" onClick={() => onRegenerate(slot)} className="gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
              )}
              {onRemove && (
                <Button variant="ghost" size="sm" onClick={() => onRemove(slot)}>
                  Remove
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Image className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Image placeholder</p>
              <p className="text-xs text-muted-foreground/70 line-clamp-2 max-w-[250px]">
                {slot.prompt || 'Image will be generated based on content'}
              </p>
            </div>
            <div className="flex gap-2">
              {onGenerate && (
                <Button variant="outline" size="sm" onClick={() => onGenerate(slot)} className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Generate
                </Button>
              )}
              {onRemove && (
                <Button variant="ghost" size="sm" onClick={() => onRemove(slot)}>
                  Remove
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
