
import React from 'react';
import { ContentItemType } from '@/contexts/content';
import { ContentEditDialog } from './ContentEditDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

interface ContentDialogsProps {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  selectedContent: ContentItemType | null;
  onSaveContent: (updates: Partial<ContentItemType>) => Promise<void>;
  onConfirmDelete: () => Promise<void>;
  isDeleting?: boolean;
}

export const ContentDialogs: React.FC<ContentDialogsProps> = ({
  isEditDialogOpen,
  setIsEditDialogOpen,
  isDeleteDialogOpen, 
  setIsDeleteDialogOpen,
  selectedContent,
  onSaveContent,
  onConfirmDelete,
  isDeleting = false
}) => {
  return (
    <>
      {/* Edit Dialog */}
      <ContentEditDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        content={selectedContent}
        onSave={onSaveContent}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={onConfirmDelete}
        title={selectedContent?.title || ''}
        isDeleting={isDeleting}
      />
    </>
  );
};
