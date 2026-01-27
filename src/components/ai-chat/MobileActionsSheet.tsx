import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Paperclip, Mic, Image, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileActionsSheetProps {
  onAttachment?: () => void;
  onVoice?: () => void;
  onImage?: () => void;
  onDocument?: () => void;
  disabled?: boolean;
}

export const MobileActionsSheet: React.FC<MobileActionsSheetProps> = ({
  onAttachment,
  onVoice,
  onImage,
  onDocument,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Paperclip, label: 'Attachment', onClick: onAttachment },
    { icon: Mic, label: 'Voice', onClick: onVoice },
    { icon: Image, label: 'Image', onClick: onImage },
    { icon: FileText, label: 'Document', onClick: onDocument },
  ].filter(action => action.onClick);

  if (actions.length === 0) return null;

  return (
    <div className="relative sm:hidden">
      {/* Trigger Button */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "text-muted-foreground/60 hover:text-muted-foreground hover:bg-transparent p-2 h-8 w-8",
          isOpen && "text-primary"
        )}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </motion.div>
      </Button>

      {/* Actions Popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Actions Menu */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 z-50 bg-card border border-border/50 rounded-xl shadow-lg p-2 min-w-[160px]"
            >
              {actions.map((action, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    action.onClick?.();
                    setIsOpen(false);
                  }}
                  className="w-full justify-start gap-3 h-10 text-muted-foreground hover:text-foreground"
                >
                  <action.icon className="h-4 w-4" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
