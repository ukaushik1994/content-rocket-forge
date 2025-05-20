
import React, { memo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GeneratedContentFormat } from './hooks/repurposing/types';
import { getFormatByIdOrDefault, contentFormats } from './formats';
import ContentPreview from './dialog/ContentPreview';
import DialogActionButtons from './dialog/DialogActionButtons';
import FormatButton from './generated-content/FormatButton';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface RepurposedContentDialogProps {
  open: boolean;
  onClose: () => void;
  content: GeneratedContentFormat | null;
  onCopy: (content: string) => void;
  onDownload: (content: string, formatName: string) => void;
  onDelete?: (contentId: string, formatId: string) => Promise<boolean>;
  onFormatChange?: (contentId: string, formatId: string) => void;
  isDeleting?: boolean;
  isSaving?: boolean;
  generatedFormats?: string[];
}

const RepurposedContentDialog: React.FC<RepurposedContentDialogProps> = memo(({
  open,
  onClose,
  content,
  onCopy,
  onDownload,
  onDelete,
  onFormatChange,
  isDeleting = false,
  isSaving = false,
  generatedFormats = []
}) => {
  const isMobile = useIsMobile();
  
  if (!content) return null;

  // Find the format information
  const format = getFormatByIdOrDefault(content.formatId);
  const formatName = format.name;

  // Get all available formats
  const availableFormats = contentFormats;

  // Filter to only show formats that have been generated or match the current format
  const relatedFormats = availableFormats
    .filter(f => {
      // Ensure both content.formatId and elements in generatedFormats are defined
      return generatedFormats.includes(f.id) || (content.formatId && f.id === content.formatId);
    })
    .map(f => ({
      id: f.id,
      name: f.name,
      isActive: content.formatId ? f.id === content.formatId : false
    }));

  const handleDelete = async () => {
    if (onDelete && content.contentId && content.formatId) {
      const success = await onDelete(content.contentId, content.formatId);
      if (success) {
        onClose();
      }
    }
  };

  const handleFormatButtonClick = (formatId: string) => {
    if (onFormatChange && content.contentId) {
      onFormatChange(content.contentId, formatId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent 
        hideCloseButton={true}
        className={`${isMobile ? 'max-w-[95vw]' : 'max-w-2xl'} max-h-[85vh] overflow-hidden flex flex-col bg-gradient-to-b from-black/95 to-black/90 border border-white/20 shadow-xl shadow-indigo-500/10 p-0 rounded-xl backdrop-blur-lg`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-black/50">
          <div className="flex flex-col">
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gradient bg-gradient-to-r from-indigo-300 to-white bg-clip-text text-transparent`}>
              {formatName}
            </h2>
            <p className="text-xs sm:text-sm text-white/70 truncate max-w-[200px] sm:max-w-full">{content.title || 'Untitled'}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        
        {relatedFormats.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-black/70 px-3 sm:px-4 py-2 sm:py-3 border-b border-white/10 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {relatedFormats.map(relatedFormat => (
                <FormatButton 
                  key={relatedFormat.id} 
                  formatId={relatedFormat.id} 
                  name={relatedFormat.name} 
                  isActive={relatedFormat.isActive} 
                  onClick={() => handleFormatButtonClick(relatedFormat.id)} 
                  className={relatedFormat.isActive 
                    ? "bg-indigo-500/90 text-white shadow-md shadow-indigo-500/20" 
                    : "bg-white/5 hover:bg-white/10 transition-colors duration-200"
                  } 
                />
              ))}
            </div>
          </motion.div>
        )}
        
        <ContentPreview content={content.content || ''} formatId={content.formatId} />
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
        >
          <DialogActionButtons 
            onCopy={() => onCopy(content.content || '')} 
            onDownload={() => onDownload(content.content || '', formatName)} 
            onDelete={onDelete ? handleDelete : undefined} 
            isDeleting={isDeleting} 
            isSaving={isSaving} 
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
});

RepurposedContentDialog.displayName = 'RepurposedContentDialog';

export default RepurposedContentDialog;
