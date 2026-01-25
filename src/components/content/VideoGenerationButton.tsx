import React, { useState, useEffect } from 'react';
import { Video, Play, Wand2, Loader2, Image as ImageIcon, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import videoGenService, { 
  VideoGenerationRequest, 
  VideoGenerationTask, 
  GeneratedVideo,
  VideoGenProviderInfo 
} from '@/services/videoGenService';

interface VideoGenerationButtonProps {
  onVideoGenerated?: (video: GeneratedVideo) => void;
  contentId?: string;
  defaultPrompt?: string;
  sourceImageUrl?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export const VideoGenerationButton: React.FC<VideoGenerationButtonProps> = ({
  onVideoGenerated,
  contentId,
  defaultPrompt = '',
  sourceImageUrl,
  className,
  variant = 'outline',
  size = 'default',
  showLabel = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<VideoGenerationTask | null>(null);
  const [provider, setProvider] = useState<VideoGenProviderInfo | null>(null);
  const [providerLoading, setProviderLoading] = useState(false);
  
  // Form state
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [mode, setMode] = useState<'text-to-video' | 'image-to-video'>('text-to-video');
  const [duration, setDuration] = useState<5 | 10>(5);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  // Check for configured provider on mount
  useEffect(() => {
    const checkProvider = async () => {
      setProviderLoading(true);
      const activeProvider = await videoGenService.getActiveVideoProvider();
      setProvider(activeProvider);
      setProviderLoading(false);
    };
    checkProvider();
  }, []);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (activeTask) {
        videoGenService.stopPolling(activeTask.id);
      }
    };
  }, [activeTask]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);

    const request: VideoGenerationRequest = {
      prompt: prompt.trim(),
      mode,
      duration,
      aspectRatio,
      ...(mode === 'image-to-video' && sourceImageUrl && { sourceImageUrl }),
    };

    const task = await videoGenService.generateVideo(request);
    
    if (task) {
      setActiveTask(task);
      
      // Start polling for completion
      videoGenService.startPolling(task, (updatedTask) => {
        setActiveTask(updatedTask);
        
        if (updatedTask.status === 'completed' && updatedTask.video) {
          setIsLoading(false);
          onVideoGenerated?.(updatedTask.video);
          
          // Attach to content if contentId provided
          if (contentId) {
            videoGenService.attachVideoToContent(contentId, updatedTask.video);
          }
        } else if (updatedTask.status === 'failed') {
          setIsLoading(false);
        }
      });
    } else {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false);
      setActiveTask(null);
      setPrompt(defaultPrompt);
    }
  };

  const getProgressPercent = (): number => {
    if (!activeTask) return 0;
    if (activeTask.status === 'completed') return 100;
    if (activeTask.status === 'failed') return 0;
    
    // Estimate progress based on time elapsed
    const elapsed = (Date.now() - new Date(activeTask.startedAt).getTime()) / 1000;
    const estimated = activeTask.estimatedTime || 60;
    return Math.min(Math.round((elapsed / estimated) * 100), 95);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={cn("gap-2", className)}
        disabled={providerLoading}
      >
        <Video className="h-4 w-4" />
        {showLabel && (size !== 'icon' ? 'Generate Video' : null)}
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Generate Video
            </DialogTitle>
            <DialogDescription>
              Create AI-generated videos from text prompts or images
            </DialogDescription>
          </DialogHeader>

          {!provider && !providerLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No video generation provider configured. Please set up Runway ML, Kling, or Replicate in Settings.
              </AlertDescription>
            </Alert>
          )}

          {provider && (
            <div className="space-y-4 py-4">
              {/* Provider Badge */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Wand2 className="h-3 w-3" />
                  {provider.name}
                </Badge>
              </div>

              {/* Generation Mode */}
              <div className="space-y-2">
                <Label>Generation Mode</Label>
                <RadioGroup
                  value={mode}
                  onValueChange={(v) => setMode(v as 'text-to-video' | 'image-to-video')}
                  className="flex gap-4"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text-to-video" id="text-to-video" />
                    <Label htmlFor="text-to-video" className="flex items-center gap-1 cursor-pointer">
                      <Play className="h-3 w-3" />
                      Text to Video
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="image-to-video" 
                      id="image-to-video"
                      disabled={!sourceImageUrl}
                    />
                    <Label 
                      htmlFor="image-to-video" 
                      className={cn(
                        "flex items-center gap-1 cursor-pointer",
                        !sourceImageUrl && "opacity-50"
                      )}
                    >
                      <ImageIcon className="h-3 w-3" />
                      Image to Video
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="video-prompt">Prompt</Label>
                <Textarea
                  id="video-prompt"
                  placeholder="Describe the video you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] resize-none"
                  disabled={isLoading}
                />
              </div>

              {/* Options Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select
                    value={String(duration)}
                    onValueChange={(v) => setDuration(Number(v) as 5 | 10)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <Select
                    value={aspectRatio}
                    onValueChange={(v) => setAspectRatio(v as '16:9' | '9:16' | '1:1')}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                      <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                      <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Progress Indicator */}
              {activeTask && isLoading && (
                <div className="space-y-2 p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating video...
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{activeTask.estimatedTime || 60}s
                    </span>
                  </div>
                  <Progress value={getProgressPercent()} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Video generation can take 1-2 minutes. Please wait...
                  </p>
                </div>
              )}

              {/* Completed Video Preview */}
              {activeTask?.status === 'completed' && activeTask.video?.url && (
                <div className="rounded-lg overflow-hidden border">
                  <video 
                    src={activeTask.video.url}
                    controls
                    className="w-full"
                    poster={activeTask.video.thumbnailUrl}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              {activeTask?.status === 'completed' ? 'Done' : 'Cancel'}
            </Button>
            {(!activeTask || activeTask.status === 'failed') && provider && (
              <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Video
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoGenerationButton;
