import React, { useState, useEffect } from 'react';
import { 
  Wand2, Copy, Expand, ZoomIn, Loader2, 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Maximize,
  Image as ImageIcon, AlertCircle, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import imageEditService, { ImageEditMode, EditedImage } from '@/services/imageEditService';
import type { GeneratedImage } from '@/services/imageGenService';

interface ImageEditingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceImage: GeneratedImage | { url: string; id?: string };
  onImageEdited?: (editedImage: EditedImage) => void;
  contentId?: string;
}

type ExpandDirection = 'up' | 'down' | 'left' | 'right' | 'all';

export const ImageEditingModal: React.FC<ImageEditingModalProps> = ({
  isOpen,
  onClose,
  sourceImage,
  onImageEdited,
  contentId
}) => {
  const [mode, setMode] = useState<ImageEditMode>('variation');
  const [prompt, setPrompt] = useState('');
  const [expandDirection, setExpandDirection] = useState<ExpandDirection>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [editedImage, setEditedImage] = useState<EditedImage | null>(null);
  const [hasProvider, setHasProvider] = useState<boolean | null>(null);

  // Check for provider on mount
  useEffect(() => {
    const checkProvider = async () => {
      const provider = await imageEditService.getActiveEditProvider();
      setHasProvider(!!provider);
    };
    if (isOpen) {
      checkProvider();
    }
  }, [isOpen]);

  const handleEdit = async () => {
    setIsLoading(true);
    setEditedImage(null);

    let result: EditedImage | null = null;

    switch (mode) {
      case 'variation':
        result = await imageEditService.createVariation(sourceImage, prompt || undefined);
        break;
      case 'inpaint':
        result = await imageEditService.inpaint(sourceImage, prompt);
        break;
      case 'expand':
        result = await imageEditService.expand(sourceImage, expandDirection, prompt || undefined);
        break;
      case 'upscale':
        result = await imageEditService.upscale(sourceImage, prompt || undefined);
        break;
    }

    setIsLoading(false);

    if (result) {
      setEditedImage(result);
      onImageEdited?.(result);
    }
  };

  const handleReplace = async () => {
    if (!editedImage || !contentId || !('id' in sourceImage)) return;
    
    const success = await imageEditService.replaceImageInContent(
      contentId,
      sourceImage.id!,
      editedImage
    );

    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEditedImage(null);
      setPrompt('');
      setMode('variation');
      onClose();
    }
  };

  const getModeInfo = (m: ImageEditMode) => {
    switch (m) {
      case 'variation':
        return {
          icon: Copy,
          title: 'Create Variation',
          description: 'Generate a new version with the same subject but different style',
          promptPlaceholder: 'Optional: Describe the style variation you want...'
        };
      case 'inpaint':
        return {
          icon: Wand2,
          title: 'Edit / Inpaint',
          description: 'Modify specific areas of the image with AI',
          promptPlaceholder: 'Describe what you want to change or add...'
        };
      case 'expand':
        return {
          icon: Expand,
          title: 'Expand Image',
          description: 'Extend the image beyond its current boundaries',
          promptPlaceholder: 'Optional: Describe what should appear in the expanded area...'
        };
      case 'upscale':
        return {
          icon: ZoomIn,
          title: 'Upscale',
          description: 'Enhance resolution and detail quality',
          promptPlaceholder: 'Optional: Describe additional details to enhance...'
        };
    }
  };

  const modeInfo = getModeInfo(mode);
  const ModeIcon = modeInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Edit Image
          </DialogTitle>
          <DialogDescription>
            Transform your image using AI-powered editing tools
          </DialogDescription>
        </DialogHeader>

        {hasProvider === false && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No image editing provider configured. Please set up OpenAI or Google Gemini in Settings.
            </AlertDescription>
          </Alert>
        )}

        {hasProvider && (
          <div className="space-y-6 py-4">
            {/* Source Image Preview */}
            <div className="flex gap-4">
              <div className="w-32 h-32 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                <img 
                  src={sourceImage.url || (sourceImage as any).base64}
                  alt="Source image"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium mb-1">Original Image</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {'prompt' in sourceImage ? sourceImage.prompt : 'Uploaded image'}
                </p>
                {editedImage && (
                  <Badge variant="secondary" className="gap-1">
                    <Check className="h-3 w-3" />
                    Edited version ready
                  </Badge>
                )}
              </div>
            </div>

            {/* Edit Mode Tabs */}
            <Tabs value={mode} onValueChange={(v) => setMode(v as ImageEditMode)}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="variation" className="gap-1 text-xs">
                  <Copy className="h-3 w-3" />
                  Variation
                </TabsTrigger>
                <TabsTrigger value="inpaint" className="gap-1 text-xs">
                  <Wand2 className="h-3 w-3" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="expand" className="gap-1 text-xs">
                  <Expand className="h-3 w-3" />
                  Expand
                </TabsTrigger>
                <TabsTrigger value="upscale" className="gap-1 text-xs">
                  <ZoomIn className="h-3 w-3" />
                  Upscale
                </TabsTrigger>
              </TabsList>

              {/* Mode Content */}
              <div className="mt-4 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ModeIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{modeInfo.title}</h4>
                    <p className="text-sm text-muted-foreground">{modeInfo.description}</p>
                  </div>
                </div>

                {/* Expand Direction Selector */}
                {mode === 'expand' && (
                  <div className="mb-4">
                    <Label className="mb-2 block">Expand Direction</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { value: 'up', icon: ArrowUp, label: 'Up' },
                        { value: 'down', icon: ArrowDown, label: 'Down' },
                        { value: 'left', icon: ArrowLeft, label: 'Left' },
                        { value: 'right', icon: ArrowRight, label: 'Right' },
                        { value: 'all', icon: Maximize, label: 'All' },
                      ].map(({ value, icon: Icon, label }) => (
                        <Button
                          key={value}
                          variant={expandDirection === value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setExpandDirection(value as ExpandDirection)}
                          className="flex-col h-auto py-2"
                          disabled={isLoading}
                        >
                          <Icon className="h-4 w-4 mb-1" />
                          <span className="text-xs">{label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prompt Input */}
                <div className="space-y-2">
                  <Label>
                    {mode === 'inpaint' ? 'Edit Instructions' : 'Additional Instructions'}
                    {mode !== 'inpaint' && <span className="text-muted-foreground ml-1">(optional)</span>}
                  </Label>
                  <Textarea
                    placeholder={modeInfo.promptPlaceholder}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[80px] resize-none"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </Tabs>

            {/* Edited Image Preview */}
            {editedImage && (
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted/50 px-3 py-2 border-b flex items-center justify-between">
                  <span className="text-sm font-medium">Edited Result</span>
                  <Badge variant="secondary">{editedImage.editMode}</Badge>
                </div>
                <div className="p-4">
                  <img 
                    src={editedImage.url || editedImage.base64}
                    alt="Edited image"
                    className="w-full h-auto rounded-lg max-h-80 object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          
          {editedImage && contentId && 'id' in sourceImage && (
            <Button variant="secondary" onClick={handleReplace} disabled={isLoading}>
              <Check className="h-4 w-4 mr-2" />
              Replace Original
            </Button>
          )}
          
          {hasProvider && (
            <Button 
              onClick={handleEdit} 
              disabled={isLoading || (mode === 'inpaint' && !prompt.trim())}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ModeIcon className="h-4 w-4 mr-2" />
                  {editedImage ? 'Edit Again' : modeInfo.title}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditingModal;
