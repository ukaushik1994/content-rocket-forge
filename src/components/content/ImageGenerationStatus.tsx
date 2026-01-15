import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Image, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageSlot } from './ImagePlaceholder';

interface ImageGenerationStatusProps {
  slots: ImageSlot[];
  className?: string;
}

export const ImageGenerationStatus: React.FC<ImageGenerationStatusProps> = ({
  slots,
  className
}) => {
  if (slots.length === 0) return null;

  const completed = slots.filter(s => s.status === 'completed').length;
  const failed = slots.filter(s => s.status === 'failed').length;
  const generating = slots.filter(s => s.status === 'generating').length;
  const pending = slots.filter(s => s.status === 'pending').length;
  const total = slots.length;
  
  const progress = total > 0 ? ((completed + failed) / total) * 100 : 0;
  const isComplete = pending === 0 && generating === 0;
  const hasFailures = failed > 0;
  const isGenerating = generating > 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isGenerating ? (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          ) : isComplete && !hasFailures ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : hasFailures ? (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          ) : (
            <Image className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {isGenerating ? 'Generating images...' : 
             isComplete && !hasFailures ? 'Images ready' :
             hasFailures ? 'Some images failed' : 
             'Images pending'}
          </span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {completed}/{total}
        </Badge>
      </div>
      
      {(isGenerating || pending > 0) && (
        <Progress value={progress} className="h-1.5" />
      )}
      
      <div className="flex flex-wrap gap-1">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className={cn(
              "h-2 w-2 rounded-full",
              slot.status === 'completed' && "bg-green-500",
              slot.status === 'generating' && "bg-primary animate-pulse",
              slot.status === 'failed' && "bg-destructive",
              slot.status === 'pending' && "bg-muted-foreground/30"
            )}
            title={`${slot.status}: ${slot.prompt.substring(0, 50)}...`}
          />
        ))}
      </div>
      
      {hasFailures && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <XCircle className="h-3 w-3 text-destructive" />
          {failed} image{failed > 1 ? 's' : ''} failed to generate
        </p>
      )}
    </div>
  );
};
