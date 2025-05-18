
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Save, Trash } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionButtonsProps {
  onCopy: () => void;
  onDownload: () => void;
  onSave: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCopy,
  onDownload,
  onSave,
  onDelete,
  isDeleting = false
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex justify-end gap-2 pt-2"
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          className="bg-black/20 border-white/20 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
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
          className="bg-black/20 border-white/20 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          className="bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border-white/20 hover:from-neon-purple/30 hover:to-neon-blue/30 backdrop-blur-sm"
        >
          <Save className="h-4 w-4 mr-1" />
          Save to Original
        </Button>
      </motion.div>
      
      {onDelete && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-400 bg-black/20 border-red-500/30 hover:bg-red-500/10 backdrop-blur-sm"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="h-4 w-4 mr-1 border-2 border-t-transparent border-red-500 rounded-full"
              />
            ) : (
              <Trash className="h-4 w-4 mr-1" />
            )}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ActionButtons;
