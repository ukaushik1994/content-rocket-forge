
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isMobile = useIsMobile();
  
  const handleCopy = () => {
    onCopy();
    toast.success("Content copied to clipboard");
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete?.();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Auto-hide after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div className="flex justify-end gap-2 sm:gap-3 p-3 sm:p-5 border-t border-white/10 bg-black/70 backdrop-blur-sm">
      <Button 
        variant="ghost" 
        size={isMobile ? "sm" : "default"} 
        onClick={handleCopy}
        className="hover:bg-white/10 text-white/90 hover:text-white transition-colors duration-200 rounded-lg"
        disabled={isSaving || isDeleting}
      >
        <Copy className="h-4 w-4 mr-1 sm:mr-2" />
        <span>Copy</span>
      </Button>
      
      <Button 
        variant="ghost" 
        size={isMobile ? "sm" : "default"} 
        onClick={onDownload}
        className="hover:bg-white/10 text-white/90 hover:text-white transition-colors duration-200 rounded-lg"
        disabled={isSaving || isDeleting}
      >
        <Download className="h-4 w-4 mr-1 sm:mr-2" />
        <span>Download</span>
      </Button>
      
      {onDelete && (
        <Button 
          variant="ghost" 
          size={isMobile ? "sm" : "default"} 
          onClick={handleDelete}
          disabled={isDeleting}
          className={showDeleteConfirm 
            ? "bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-red-200 transition-colors duration-200 rounded-lg"
            : "hover:bg-red-500/10 text-white/90 hover:text-red-400 transition-colors duration-200 rounded-lg"
          }
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
              <span>{showDeleteConfirm ? "Confirm" : "Delete"}</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default DialogActionButtons;
