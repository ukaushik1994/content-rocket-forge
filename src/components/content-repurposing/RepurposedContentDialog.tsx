
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GeneratedContentFormat } from './hooks/repurposing/types';
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';
import DialogHeaderSection from './dialog/DialogHeaderSection';
import ContentPreview from './dialog/ContentPreview';
import DialogActionButtons from './dialog/DialogActionButtons';

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
        <DialogHeaderSection 
          title={content.title}
          formatName={formatName}
          onClose={onClose}
        />
        
        <ContentPreview content={content.content} />
        
        <DialogActionButtons
          onCopy={() => onCopy(content.content)}
          onDownload={() => onDownload(content.content, formatName)}
          onDelete={onDelete ? handleDelete : undefined}
          isDeleting={isDeleting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RepurposedContentDialog;
