
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GeneratedContentFormat } from './hooks/repurposing/types';
import { getFormatByIdOrDefault, contentFormats } from './formats';
import DialogHeaderSection from './dialog/DialogHeaderSection';
import ContentPreview from './dialog/ContentPreview';
import DialogActionButtons from './dialog/DialogActionButtons';
import FormatButton from './generated-content/FormatButton';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface RepurposedContentDialogProps {
  open: boolean;
  onClose: () => void;
  content: GeneratedContentFormat | null;
  onCopy: (content: string) => void;
  onDownload: (content: string, formatName: string) => void;
  onDelete?: (contentId: string, formatId: string) => Promise<boolean>;
  isDeleting?: boolean;
  isSaving?: boolean;
}

const RepurposedContentDialog: React.FC<RepurposedContentDialogProps> = ({
  open,
  onClose,
  content,
  onCopy,
  onDownload,
  onDelete,
  isDeleting = false,
  isSaving = false
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col bg-black border border-white/10 p-0 rounded-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">{formatName}</h2>
            <p className="text-sm text-muted-foreground">{content.title}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="bg-black/70 px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {relatedFormats.map(relatedFormat => (
              <FormatButton
                key={relatedFormat.id}
                formatId={relatedFormat.id}
                name={relatedFormat.name}
                isActive={relatedFormat.isActive}
                onClick={() => {}}
                className={relatedFormat.isActive ? "bg-indigo-500/80 text-white" : ""}
              />
            ))}
          </div>
        </div>
        
        <ContentPreview content={content.content} />
        
        <DialogActionButtons
          onCopy={() => onCopy(content.content)}
          onDownload={() => onDownload(content.content, formatName)}
          onDelete={onDelete ? handleDelete : undefined}
          isDeleting={isDeleting}
          isSaving={isSaving}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RepurposedContentDialog;
