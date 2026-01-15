import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  RefreshCw, 
  Maximize2, 
  Copy, 
  Check,
  Image as ImageIcon,
  Sparkles,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export interface GeneratedImageData {
  id: string;
  url: string;
  prompt: string;
  provider?: string;
  model?: string;
  createdAt?: string;
  width?: number;
  height?: number;
}

interface GeneratedImageCardProps {
  image: GeneratedImageData;
  onRegenerate?: (prompt: string) => void;
  onDownload?: (url: string, filename: string) => void;
  isGenerating?: boolean;
  className?: string;
  compact?: boolean;
}

export const GeneratedImageCard: React.FC<GeneratedImageCardProps> = ({
  image,
  onRegenerate,
  onDownload,
  isGenerating = false,
  className,
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { toast } = useToast();

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(image.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Image prompt copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy prompt to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload(image.url, `generated-image-${image.id}.png`);
    } else {
      // Default download behavior
      try {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `generated-image-${image.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({
          title: "Downloaded!",
          description: "Image saved to your downloads",
        });
      } catch (err) {
        toast({
          title: "Download failed",
          description: "Could not download the image",
          variant: "destructive"
        });
      }
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative group rounded-lg overflow-hidden border border-border/50 bg-background/50",
          className
        )}
      >
        <div className="aspect-square relative">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
            </div>
          )}
          <img
            src={image.url}
            alt={image.prompt}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsExpanded(true)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expanded view dialog */}
        <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Generated Image
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={image.url}
                alt={image.prompt}
                className="w-full rounded-lg"
              />
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-muted-foreground flex-1">
                  <span className="font-medium text-foreground">Prompt: </span>
                  {image.prompt}
                </p>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={handleCopyPrompt}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                  {onRegenerate && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onRegenerate(image.prompt)}
                      disabled={isGenerating}
                    >
                      <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full", className)}
    >
      <Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm">
        {/* Image container */}
        <div className="relative group">
          {!imageLoaded && (
            <div className="aspect-video bg-muted animate-pulse flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="h-8 w-8 text-primary/50 mx-auto mb-2 animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading image...</p>
              </div>
            </div>
          )}
          <img
            src={image.url}
            alt={image.prompt}
            className={cn(
              "w-full transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Hover overlay with actions */}
          <AnimatePresence>
            {imageLoaded && (
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-4"
              >
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={() => setIsExpanded(true)}
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Expand
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                
                {image.provider && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {image.provider}
                  </Badge>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Prompt section */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
              <span className="font-medium text-foreground">Prompt: </span>
              {image.prompt}
            </p>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 flex-shrink-0"
              onClick={handleCopyPrompt}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {onRegenerate && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onRegenerate(image.prompt)}
              disabled={isGenerating}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
              {isGenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          )}
        </div>
      </Card>

      {/* Expanded view dialog */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generated Image
              {image.provider && (
                <Badge variant="secondary" className="ml-2">
                  {image.provider}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <img
              src={image.url}
              alt={image.prompt}
              className="w-full rounded-lg"
            />
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Prompt: </span>
                  {image.prompt}
                </p>
                {image.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    Generated: {new Date(image.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={handleCopyPrompt}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                {onRegenerate && (
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={() => {
                      onRegenerate(image.prompt);
                      setIsExpanded(false);
                    }}
                    disabled={isGenerating}
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-1", isGenerating && "animate-spin")} />
                    Regenerate
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default GeneratedImageCard;
