
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GeneratedContentFormat } from './hooks/repurposing/types';
import { getFormatByIdOrDefault, contentFormats } from './formats';
import DialogHeaderSection from './dialog/DialogHeaderSection';
import ContentPreview from './dialog/ContentPreview';
import DialogActionButtons from './dialog/DialogActionButtons';
import FormatButton from './generated-content/FormatButton';
import { motion } from 'framer-motion';

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
  const format = getFormatByIdOrDefault(content.formatId);
  const formatName = format.name;
  
  // Get the related formats - in a real app you might get this from the API
  const relatedFormats = contentFormats.slice(0, 5).map(f => ({
    id: f.id,
    name: f.name,
    isActive: f.id === content.formatId
  }));
  
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col bg-gradient-to-br from-black/90 to-black/95 border-white/10 p-0">
        <DialogHeaderSection 
          title={content.title}
          formatName={formatName}
          onClose={onClose}
        />
        
        <div className="flex items-center gap-2 px-6 py-3 border-b border-white/10 overflow-x-auto">
          <motion.div className="flex gap-2 w-full" layout>
            {relatedFormats.map(relatedFormat => (
              <FormatButton
                key={relatedFormat.id}
                formatId={relatedFormat.id}
                name={relatedFormat.name}
                isActive={relatedFormat.isActive}
                onClick={() => {}}
              />
            ))}
          </motion.div>
        </div>
        
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
