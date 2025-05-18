
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Copy, Download, Trash2, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ActionButtonsProps {
  onCopy: () => void;
  onDownload: () => void;
  onSave: () => void;
  onDelete?: () => Promise<boolean>;
  onRegenerate?: () => Promise<void>;
  isDeleting?: boolean;
  isRegenerating?: boolean;
  isSaving?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCopy,
  onDownload,
  onSave,
  onDelete,
  onRegenerate,
  isDeleting = false,
  isRegenerating = false,
  isSaving = false
}) => {
  return (
    <div className="flex justify-between items-center mt-4 border-t border-white/10 pt-4">
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary" 
                size="sm" 
                onClick={onCopy}
                className="text-xs"
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy content to clipboard</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onDownload}
                className="text-xs"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Download
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download as text file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {onRegenerate && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRegenerate}
                  disabled={isRegenerating}
                  className="text-xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate new version</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex gap-2">
        {onDelete && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete this content</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size="sm" 
                onClick={onSave}
                disabled={isSaving}
                className="text-xs bg-gradient-to-r from-neon-purple to-neon-blue"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save to your content library</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ActionButtons;
