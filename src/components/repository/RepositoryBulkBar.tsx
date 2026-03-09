import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trash2, X, CheckSquare, Square } from 'lucide-react';
import { useContent } from '@/contexts/content';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RepositoryBulkBarProps {
  selectedIds: Set<string>;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export const RepositoryBulkBar: React.FC<RepositoryBulkBarProps> = ({
  selectedIds,
  totalCount,
  onSelectAll,
  onClearSelection,
}) => {
  const { deleteContentItem } = useContent();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const count = selectedIds.size;
  if (count === 0) return null;

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    let deleted = 0;
    for (const id of selectedIds) {
      try {
        await deleteContentItem(id);
        deleted++;
      } catch (e) {
        console.error('Failed to delete', id, e);
      }
    }
    toast.success(`Deleted ${deleted} item${deleted !== 1 ? 's' : ''}`);
    onClearSelection();
    setShowDeleteDialog(false);
    setIsDeleting(false);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={count === totalCount ? onClearSelection : onSelectAll}
              className="text-xs"
            >
              {count === totalCount ? (
                <><Square className="h-3.5 w-3.5 mr-1" /> Deselect</>
              ) : (
                <><CheckSquare className="h-3.5 w-3.5 mr-1" /> All</>
              )}
            </Button>

            <span className="text-sm font-medium text-foreground/80">
              {count} selected
            </span>

            <div className="h-4 w-px bg-border/60" />

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>

            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClearSelection}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {count} item{count !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All selected content will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleBulkDelete();
              }}
            >
              {isDeleting ? 'Deleting...' : `Delete ${count} item${count !== 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
