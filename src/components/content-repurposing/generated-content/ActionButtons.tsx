
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Save, Trash2, Loader2, SaveAll, Share2 } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface ActionButtonsProps {
  onCopy: () => void;
  onDownload: () => void;
  onSave: () => void;
  onShare?: () => void;
  onSaveAll?: () => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
  isDeleting?: boolean;
  isSaving?: boolean;
  isSavingAll?: boolean;
  hasMultipleFormats?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = memo(({
  onCopy,
  onDownload,
  onSave,
  onShare,
  onSaveAll,
  onDelete,
  isDeleting = false,
  isSaving = false,
  isSavingAll = false,
  hasMultipleFormats = false
}) => {
  return (
    <div className="flex justify-end flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCopy}
              className="bg-transparent hover:bg-white/10 border-white/10 transition-all duration-200"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Copy content to clipboard</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDownload}
              className="bg-transparent hover:bg-white/10 border-white/10 transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Download as text file</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSave}
              disabled={isSaving}
              className="bg-transparent hover:bg-white/10 border-white/10 transition-all duration-200"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Save content to your library</p>
          </TooltipContent>
        </Tooltip>

        {hasMultipleFormats && onSaveAll && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  if (onSaveAll) await onSaveAll();
                }}
                disabled={isSavingAll}
                className="bg-transparent hover:bg-white/10 border-white/10 transition-all duration-200"
              >
                {isSavingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Saving All...
                  </>
                ) : (
                  <>
                    <SaveAll className="h-4 w-4 mr-1" />
                    Save All
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Save all generated formats at once</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {onShare && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onShare}
                className="bg-transparent hover:bg-white/10 border-white/10 transition-all duration-200"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Share this content</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {onDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  if (onDelete) await onDelete();
                }}
                disabled={isDeleting}
                className="bg-transparent hover:bg-white/10 hover:text-red-400 border-white/10 transition-all duration-200"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Delete this content</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';

export default ActionButtons;
