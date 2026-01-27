import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Copy, 
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { MessageEditDialog } from './MessageEditDialog';

interface MessageActionsProps {
  messageId: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  onEdit?: (messageId: string, newContent: string) => Promise<void>;
  onDelete?: (messageId: string) => Promise<void>;
}

const EDIT_WINDOW_MINUTES = 5;

export const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  content,
  isUser,
  timestamp,
  onEdit,
  onDelete
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if within edit window (5 minutes)
  const isWithinEditWindow = () => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes <= EDIT_WINDOW_MINUTES;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Message copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const handleEdit = async (newContent: string) => {
    if (!onEdit) return;
    
    try {
      await onEdit(messageId, newContent);
      setShowEditDialog(false);
      toast.success('Message updated');
    } catch (error) {
      toast.error('Failed to update message');
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(messageId);
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const canEdit = isUser && isWithinEditWindow() && onEdit;
  const canDelete = isUser && onDelete;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5 mr-2" />
            Copy
          </DropdownMenuItem>
          
          {canEdit && (
            <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
              <Edit2 className="h-3.5 w-3.5 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
          
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-0 right-0 z-10 flex items-center gap-1 bg-card border border-border rounded-lg p-1 shadow-lg"
          >
            <span className="text-xs text-muted-foreground px-2">Delete?</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Dialog */}
      <MessageEditDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        initialContent={content}
        onSave={handleEdit}
      />
    </>
  );
};
