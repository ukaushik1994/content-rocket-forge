
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Trash2, Loader2 } from 'lucide-react';

interface DialogActionButtonsProps {
  onCopy: () => void;
  onDownload: () => void;
  onDelete?: () => Promise<void>;
  isDeleting?: boolean;
  isSaving?: boolean;
}

const DialogActionButtons: React.FC<DialogActionButtonsProps> = memo(({
  onCopy,
  onDownload,
  onDelete,
  isDeleting = false,
  isSaving = false
}) => {
  return (
    <div className="flex justify-end gap-2 p-4 border-t border-white/10 bg-black/50">
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
      
      {onDelete && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onDelete}
          disabled={isDeleting || isSaving}
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

DialogActionButtons.displayName = 'DialogActionButtons';

export default DialogActionButtons;
