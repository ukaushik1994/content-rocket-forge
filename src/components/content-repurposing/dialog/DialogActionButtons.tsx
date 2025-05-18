
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download, Trash, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <DialogFooter className="px-6 py-4 border-t border-white/10 flex flex-wrap items-center justify-end gap-2">
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Button
          variant="outline"
          className="border-white/20 hover:bg-white/5"
          onClick={onCopy}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Button
          variant="outline"
          className="border-white/20 hover:bg-white/5"
          onClick={onDownload}
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Button
          variant="outline"
          className="border-white/20 hover:bg-white/5"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Regenerate
        </Button>
      </motion.div>
      
      {onDelete && (
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-950/20 hover:text-red-300"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash className="h-4 w-4 mr-1" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </motion.div>
      )}
    </DialogFooter>
  );
};

export default DialogActionButtons;
