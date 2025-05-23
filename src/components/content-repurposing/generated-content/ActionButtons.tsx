
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Copy, 
  Download, 
  Save, 
  Trash, 
  CheckCircle,
  Loader2,
  Eye
} from 'lucide-react';

interface ActionButtonsProps {
  onCopy: () => void;
  onDownload: () => void;
  onSave?: () => Promise<boolean>;
  onSaveAll?: () => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
  onPreview?: () => void;
  isSaving?: boolean;
  isSavingAll?: boolean;
  isDeleting?: boolean;
  hasMultipleFormats?: boolean;
  isFormatSaved?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCopy,
  onDownload,
  onSave,
  onSaveAll,
  onDelete,
  onPreview,
  isSaving = false,
  isSavingAll = false,
  isDeleting = false,
  hasMultipleFormats = false,
  isFormatSaved = false
}) => {
  return (
    <div className="flex items-center justify-between mt-4 border-t pt-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCopy} 
          className="gap-1"
        >
          <Copy className="h-4 w-4" />
          <span className="hidden sm:inline">Copy</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onDownload}
          className="gap-1"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </Button>
        
        {onPreview && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onPreview}
            className="gap-1"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {isFormatSaved ? (
          <Button 
            variant="outline" 
            size="sm" 
            disabled
            className="gap-1 text-green-500"
          >
            <CheckCircle className="h-4 w-4" />
            Saved
          </Button>
        ) : onSave && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSave}
            disabled={isSaving || isSavingAll}
            className="gap-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save</span>
              </>
            )}
          </Button>
        )}
        
        {onSaveAll && hasMultipleFormats && (
          <>
            <Separator orientation="vertical" className="h-6" />
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onSaveAll}
              disabled={isSaving || isSavingAll}
              className="gap-1"
            >
              {isSavingAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving all...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save all</span>
                </>
              )}
            </Button>
          </>
        )}
        
        {onDelete && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDelete}
            disabled={isDeleting}
            className="gap-1 text-destructive hover:bg-destructive/10"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActionButtons;
