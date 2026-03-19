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
  X,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Pin
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
  onRegenerate?: () => void;
  onFeedback?: (messageId: string, helpful: boolean) => void;
  onPin?: (messageId: string) => void;
  feedbackValue?: boolean | null;
  isPinned?: boolean;
}

const EDIT_WINDOW_MINUTES = 5;

export const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  content,
  isUser,
  timestamp,
  onEdit,
  onDelete,
  onRegenerate,
  onFeedback,
  onPin,
  feedbackValue,
  isPinned = false
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
  const canDelete = onDelete;

  return (
    <>
      {/* Always-visible quick actions for mobile + desktop */}
      <div className="flex items-center gap-1">
        {/* Thumbs Up/Down — AI messages only */}
        {!isUser && onFeedback && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback(messageId, true)}
              className={`h-6 w-6 p-0 transition-colors ${
                feedbackValue === true 
                  ? 'text-green-500 hover:text-green-600' 
                  : 'text-muted-foreground hover:text-green-500'
              }`}
              aria-label="Helpful"
            >
              <ThumbsUp className={`h-3.5 w-3.5 ${feedbackValue === true ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback(messageId, false)}
              className={`h-6 w-6 p-0 transition-colors ${
                feedbackValue === false 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-red-500'
              }`}
              aria-label="Not helpful"
            >
              <ThumbsDown className={`h-3.5 w-3.5 ${feedbackValue === false ? 'fill-current' : ''}`} />
            </Button>
          </>
        )}

        {/* Copy */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Copy message"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>

        {/* Regenerate — AI messages only */}
        {!isUser && onRegenerate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Regenerate response"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Pin — AI messages only */}
        {!isUser && onPin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPin(messageId)}
            className={`h-6 w-6 p-0 transition-colors ${
              isPinned 
                ? 'text-primary hover:text-primary/80' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label={isPinned ? "Unpin message" : "Pin message"}
          >
            <Pin className={`h-3.5 w-3.5 ${isPinned ? 'fill-current' : ''}`} />
          </Button>
        )}

        {/* More menu for Edit/Delete */}
        {(canEdit || canDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {canEdit && (
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Edit2 className="h-3.5 w-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              
              {canDelete && (
                <>
                  {canEdit && <DropdownMenuSeparator />}
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
        )}
      </div>

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
