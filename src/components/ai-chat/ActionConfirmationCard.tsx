import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const TOOL_LABELS: Record<string, string> = {
  delete_content_item: 'Delete Content',
  delete_solution: 'Delete Solution',
  send_email_campaign: 'Send Email Campaign',
  send_quick_email: 'Send Email',
};

interface ActionConfirmationCardProps {
  toolName: string;
  originalMessage: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ActionConfirmationCard: React.FC<ActionConfirmationCardProps> = ({
  toolName,
  originalMessage,
  onConfirm,
  onCancel,
}) => {
  const [acted, setActed] = useState(false);

  const label = TOOL_LABELS[toolName] || toolName.replace(/_/g, ' ');

  const handleConfirm = () => {
    if (acted) return;
    setActed(true);
    onConfirm();
  };

  const handleCancel = () => {
    if (acted) return;
    setActed(true);
    onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="border-destructive/30 bg-destructive/5 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 flex-shrink-0">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Confirmation Required
            </p>
            <p className="text-xs text-muted-foreground">
              About to execute: <span className="font-medium text-foreground">{label}</span>
            </p>
            <p className="text-xs text-muted-foreground/70 truncate max-w-[300px]">
              "{originalMessage}"
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={acted}
            className="h-8 gap-1.5 text-xs"
          >
            <X className="h-3 w-3" />
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={acted}
            className="h-8 gap-1.5 text-xs"
          >
            <Check className="h-3 w-3" />
            Confirm
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
