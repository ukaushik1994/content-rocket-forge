
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Save, Loader2, SaveAll, Check } from 'lucide-react';

interface ActionButtonsProps {
  onCopy: () => void;
  onDownload: () => void;
  onSave: () => void;
  onSaveAll?: () => Promise<boolean>;
  isSaving?: boolean;
  isSavingAll?: boolean;
  hasMultipleFormats?: boolean;
  isFormatSaved?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = memo(({
  onCopy,
  onDownload,
  onSave,
  onSaveAll,
  isSaving = false,
  isSavingAll = false,
  hasMultipleFormats = false,
  isFormatSaved = false
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
        disabled={isSaving || isFormatSaved}
        className={isFormatSaved ? 
          "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/40" : 
          "bg-transparent hover:bg-white/5 border-white/10"
        }
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Saving...
          </>
        ) : isFormatSaved ? (
          <>
            <Check className="h-4 w-4 mr-1" />
            Saved
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
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';

export default ActionButtons;
