
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Save, Trash, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionButtonsProps {
  onCopy: () => void;
  onDownload: () => void;
  onSave: () => void;
  onDelete?: () => void;
  onRegenerate?: () => void;
  isDeleting?: boolean;
  isRegenerating?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCopy,
  onDownload,
  onSave,
  onDelete,
  onRegenerate,
  isDeleting = false,
  isRegenerating = false
}) => {
  return (
    <motion.div 
      className="flex justify-end gap-2 pt-3 border-t border-white/10 mt-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={onCopy}
        className="hover:bg-white/5 border-white/10"
      >
        <Copy className="h-4 w-4 mr-1" />
        Copy
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDownload}
        className="hover:bg-white/5 border-white/10"
      >
        <Download className="h-4 w-4 mr-1" />
        Download
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSave}
        className="hover:bg-white/5 border-white/10"
      >
        <Save className="h-4 w-4 mr-1" />
        Save
      </Button>
      {onRegenerate && (
        <Button
          variant="outline"
          size="sm"
          className="text-neon-blue hover:text-neon-purple hover:bg-white/5 border-white/10"
          onClick={onRegenerate}
          disabled={isRegenerating}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
          {isRegenerating ? 'Regenerating...' : 'Regenerate'}
        </Button>
      )}
      {onDelete && (
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
      )}
    </motion.div>
  );
};

export default ActionButtons;
