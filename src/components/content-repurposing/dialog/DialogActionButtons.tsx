
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Trash2, Loader2 } from 'lucide-react';

interface DialogActionButtonsProps {
  onCopy: () => void;
  onDownload: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  isSaving?: boolean;
}

const DialogActionButtons: React.FC<DialogActionButtonsProps> = ({
  onCopy,
  onDownload,
  onDelete,
  isDeleting = false,
  isSaving = false
}) => {
  return (
    <div className="flex justify-end gap-2 p-4 border-t border-white/10 bg-black/50">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onCopy}
        className="hover:bg-white/10"
      >
        <Copy className="h-5 w-5" />
        <span className="ml-2">Copy</span>
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onDownload}
        className="hover:bg-white/10"
      >
        <Download className="h-5 w-5" />
        <span className="ml-2">Download</span>
      </Button>
      
      {onDelete && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDelete}
          disabled={isDeleting}
          className="hover:bg-white/10 hover:text-red-400"
        >
          {isDeleting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Trash2 className="h-5 w-5" />
          )}
        </Button>
      )}
    </div>
  );
};

export default DialogActionButtons;
