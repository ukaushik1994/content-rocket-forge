
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download, Trash, X } from 'lucide-react';
import { GeneratedContentFormat } from './hooks/repurposing/types';
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';

interface RepurposedContentDialogProps {
  open: boolean;
  onClose: () => void;
  content: GeneratedContentFormat | null;
  onCopy: (content: string) => void;
  onDownload: (content: string, formatName: string) => void;
  onDelete?: (contentId: string, formatId: string) => Promise<boolean>;
  isDeleting?: boolean;
}

const RepurposedContentDialog: React.FC<RepurposedContentDialogProps> = ({
  open,
  onClose,
  content,
  onCopy,
  onDownload,
  onDelete,
  isDeleting = false
}) => {
  if (!content) return null;
  
  // Find the format information
  const format = contentFormats.find(f => f.id === content.formatId);
  const formatName = format?.name || 'Repurposed Content';
  
  const handleDelete = async () => {
    if (onDelete && content.contentId && content.formatId) {
      const success = await onDelete(content.contentId, content.formatId);
      if (success) {
        onClose();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-gradient-to-br from-black/90 to-black/95 border-white/10">
        <DialogHeader className="border-b border-white/10 pb-3">
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>{formatName} - {content.title}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto my-4 bg-black/30 p-4 rounded">
          <pre className="whitespace-pre-wrap text-sm">{content.content}</pre>
        </div>
        
        <DialogFooter className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopy(content.content)}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(content.content, formatName)}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-600"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash className="h-4 w-4 mr-1" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RepurposedContentDialog;
