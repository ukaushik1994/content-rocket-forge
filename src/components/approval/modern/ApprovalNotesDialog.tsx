import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface ApprovalNotesDialogProps {
  open: boolean;
  action: 'approve' | 'reject' | 'request_changes';
  onClose: () => void;
  onSubmit: (notes: string) => void;
}

const actionConfig = {
  approve: {
    title: 'Approve Content',
    description: 'Add optional notes for the approval.',
    icon: CheckCircle2,
    iconClass: 'text-green-500',
    buttonLabel: 'Approve',
    buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
    required: false,
  },
  reject: {
    title: 'Reject Content',
    description: 'Please provide a reason for rejecting this content.',
    icon: XCircle,
    iconClass: 'text-destructive',
    buttonLabel: 'Reject',
    buttonClass: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    required: true,
  },
  request_changes: {
    title: 'Request Changes',
    description: 'Describe the changes needed before this content can be approved.',
    icon: AlertCircle,
    iconClass: 'text-orange-500',
    buttonLabel: 'Request Changes',
    buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white',
    required: true,
  },
};

export const ApprovalNotesDialog: React.FC<ApprovalNotesDialogProps> = ({
  open,
  action,
  onClose,
  onSubmit,
}) => {
  const [notes, setNotes] = useState('');
  const config = actionConfig[action];
  const Icon = config.icon;

  const handleSubmit = () => {
    if (config.required && !notes.trim()) return;
    onSubmit(notes);
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.iconClass}`} />
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Add your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="resize-none"
        />
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className={config.buttonClass}
            onClick={handleSubmit}
            disabled={config.required && !notes.trim()}
          >
            {config.buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
