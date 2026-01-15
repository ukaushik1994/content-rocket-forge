
import React, { memo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GeneratedContentFormat } from './hooks/repurposing/types';
import { getFormatByIdOrDefault, contentFormats } from './formats';
import ContentPreview from './dialog/ContentPreview';
import DialogActionButtons from './dialog/DialogActionButtons';
import FormatButton from './generated-content/FormatButton';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Film } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { MediaAssetsSection } from '@/components/content/MediaAssetsSection';
import { VideoPlaceholder } from '@/components/content/VideoPlaceholder';
import { GeneratedImageVisualData } from '@/types/enhancedChat';

// Video-eligible format IDs
const VIDEO_ELIGIBLE_FORMATS = ['video-script', 'tiktok', 'youtube', 'reels', 'shorts'];

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
  generatedImages?: GeneratedImageVisualData[];
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
  generatedFormats = [],
  generatedImages = []
}) => {
  const isMobile = useIsMobile();
  
  if (!content) return null;

  // Find the format information - ensure we pass a valid formatId
  const formatId = content.formatId || '';
  const format = getFormatByIdOrDefault(formatId);
  const formatName = format.name;
  const isVideoEligible = VIDEO_ELIGIBLE_FORMATS.includes(formatId);
  const hasMedia = generatedImages.length > 0 || isVideoEligible;

  // Get all available formats (no longer limiting to 5)
  const availableFormats = contentFormats;

  // Filter to only show formats that have been generated or match the current format
  const relatedFormats = availableFormats
    .filter(f => generatedFormats.includes(f.id) || f.id === content.formatId)
    .map(f => ({
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

  const handleFormatButtonClick = (formatId: string) => {
    if (onFormatChange && content.contentId && formatId !== content.formatId) {
      onFormatChange(content.contentId, formatId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw]' : 'max-w-2xl'} max-h-[85vh] overflow-hidden flex flex-col bg-gradient-to-b from-black/95 to-black/90 border border-white/20 shadow-xl shadow-indigo-500/10 p-0 rounded-xl backdrop-blur-lg`}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-black/50">
          <div className="flex flex-col">
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gradient bg-gradient-to-r from-indigo-300 to-white bg-clip-text text-transparent flex items-center gap-2`}>
              {formatName}
              {generatedImages.length > 0 && (
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1 text-xs">
                  <ImageIcon className="h-3 w-3" />
                  {generatedImages.length}
                </Badge>
              )}
              {isVideoEligible && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 gap-1 text-xs">
                  <Film className="h-3 w-3" />
                  Soon
                </Badge>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-white/70 truncate max-w-[200px] sm:max-w-full">{content.title || 'Untitled Content'}</p>
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
        
        <ContentPreview content={content.content} />
        
        {/* Media Assets Section */}
        {hasMedia && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 sm:px-6 py-3 border-t border-white/10 bg-black/30"
          >
            {generatedImages.length > 0 && (
              <MediaAssetsSection
                images={generatedImages.map(img => ({
                  id: img.id,
                  url: img.url,
                  type: 'image' as const,
                  prompt: img.prompt,
                  createdAt: img.createdAt
                }))}
                title="Media Assets"
                maxDisplay={4}
                variant="compact"
                isCollapsible={false}
                showVideoPlaceholder={false}
              />
            )}
            
            {isVideoEligible && (
              <div className={generatedImages.length > 0 ? 'mt-3' : ''}>
                <VideoPlaceholder 
                  variant="inline"
                />
              </div>
            )}
          </motion.div>
        )}
        
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
