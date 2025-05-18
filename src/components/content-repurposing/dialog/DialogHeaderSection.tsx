
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface DialogHeaderSectionProps {
  title: string;
  formatName: string;
  onClose: () => void;
}

const DialogHeaderSection: React.FC<DialogHeaderSectionProps> = ({
  title,
  formatName,
  onClose
}) => {
  return (
    <DialogHeader className="px-6 py-4 border-b border-white/10">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-xl flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col"
          >
            <span className="font-semibold">{title}</span>
            <span className="text-sm text-muted-foreground mt-1">
              {formatName} Format
            </span>
          </motion.div>
        </DialogTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </DialogHeader>
  );
};

export default DialogHeaderSection;
