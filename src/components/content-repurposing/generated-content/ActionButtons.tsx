
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Save, Trash2, Loader2, SaveAll } from 'lucide-react';

interface ActionButtonsProps {
  onCopy: () => void;
  onDownload: () => void;
  onSave: () => void;
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
  onSaveAll,
  onDelete,
  isDeleting = false,
  isSaving = false,
  isSavingAll = false,
  hasMultipleFormats = false
}) => {
  return (
    <div className="flex justify-end gap-2 mt-4 border-t border-white/10 pt-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onCopy}
        className="bg-transparent hover:bg-white/5 border-white/10"
      >
        <Copy className="h-4 w-4 mr-1" />
        Copy
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onDownload}
        className="bg-transparent hover:bg-white/5 border-white/10"
      >
        <Download className="h-4 w-4 mr-1" />
        Download
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onSave}
        disabled={isSaving}
        className="bg-transparent hover:bg-white/5 border-white/10"
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

      {hasMultipleFormats && onSaveAll && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={async () => {
            if (onSaveAll) await onSaveAll();
          }}
          disabled={isSavingAll}
          className="bg-transparent hover:bg-white/5 border-white/10"
          title="Save all generated content formats"
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
      )}
      
      {onDelete && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={async () => {
            if (onDelete) await onDelete();
          }}
          disabled={isDeleting}
          className="bg-transparent hover:bg-white/5 hover:text-red-400 border-white/10"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';

export default ActionButtons;
