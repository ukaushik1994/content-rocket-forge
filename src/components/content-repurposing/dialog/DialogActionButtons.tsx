
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download, Trash } from 'lucide-react';
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
    <DialogFooter className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          className="hover:bg-white/5 border-white/10"
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="hover:bg-white/5 border-white/10"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </motion.div>
      {onDelete && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-white/5 border-white/10"
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
