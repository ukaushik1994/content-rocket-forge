
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
    <DialogHeader className="border-b border-white/10 pb-3">
      <DialogTitle className="text-xl flex items-center justify-between">
        <span>{formatName} - {title}</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </DialogTitle>
    </DialogHeader>
  );
};

export default DialogHeaderSection;
