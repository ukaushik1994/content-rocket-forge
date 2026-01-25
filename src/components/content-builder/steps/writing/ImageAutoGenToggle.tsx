import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ImageIcon, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ImageAutoGenToggleProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  isGenerating?: boolean;
  imagesCount?: number;
  providerAvailable?: boolean;
}

export const ImageAutoGenToggle: React.FC<ImageAutoGenToggleProps> = ({
  enabled,
  onEnabledChange,
  isGenerating = false,
  imagesCount = 0,
  providerAvailable = true
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
            enabled 
              ? 'bg-primary/10 border-primary/30' 
              : 'bg-background/50 border-border'
          } ${!providerAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="flex items-center gap-2">
              {isGenerating ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              ) : (
                <ImageIcon className={`h-4 w-4 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
              )}
              <Label 
                htmlFor="auto-gen-images" 
                className={`text-sm font-medium cursor-pointer ${
                  enabled ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Auto Images
              </Label>
            </div>
            
            <Switch
              id="auto-gen-images"
              checked={enabled}
              onCheckedChange={onEnabledChange}
              disabled={!providerAvailable || isGenerating}
              className="data-[state=checked]:bg-primary"
            />
            
            {imagesCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {imagesCount}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {providerAvailable ? (
            <p>
              {enabled 
                ? 'Images will be auto-generated after content is created' 
                : 'Enable to auto-generate images with your content'}
            </p>
          ) : (
            <p className="text-amber-500">
              No image provider configured. Set up in Settings → API Keys → Image/Video Gen
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
