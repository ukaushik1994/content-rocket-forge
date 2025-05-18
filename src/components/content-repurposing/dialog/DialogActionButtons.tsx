
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download, Trash } from 'lucide-react';

interface DialogActionButtonsProps {
  onCopy: () => void;
  onDownload: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const DialogActionButtons: React.FC<DialogActionButtonsProps> = ({
  onCopy,
  onDownload,
  onDelete,
  isDeleting = false
}) => {
  return (
    <DialogFooter className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onCopy}
      >
        <Copy className="h-4 w-4 mr-1" />
        Copy
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDownload}
      >
        <Download className="h-4 w-4 mr-1" />
        Download
      </Button>
      {onDelete && (
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-600"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash className="h-4 w-4 mr-1" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      )}
    </DialogFooter>
  );
};

export default DialogActionButtons;
