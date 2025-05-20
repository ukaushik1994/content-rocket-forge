
import React from 'react';
import { Eye, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PreviewModeToggleProps {
  isPreviewMode: boolean;
  onToggle: () => void;
}

const PreviewModeToggle: React.FC<PreviewModeToggleProps> = ({ isPreviewMode, onToggle }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 bg-transparent hover:bg-white/5 border-white/10"
          >
            {isPreviewMode ? (
              <Eye className="h-4 w-4 text-white/80" />
            ) : (
              <Code className="h-4 w-4 text-white/80" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Toggle {isPreviewMode ? 'code' : 'preview'} view</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PreviewModeToggle;
