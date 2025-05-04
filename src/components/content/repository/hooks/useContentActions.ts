
import { useState, useCallback } from 'react';
import { ContentItemType } from '@/contexts/content';
import { useContent } from '@/contexts/content';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function useContentActions() {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { updateContentItem, deleteContentItem, contentItems } = useContent();
  const navigate = useNavigate();
  
  const handleSelectContent = (id: string) => {
    setSelectedContentId(id);
  };

  const handleEditContent = (id: string) => {
    setSelectedContentId(id);
    setIsEditDialogOpen(true);
  };
  
  const handlePreviewContent = (id: string) => {
    setSelectedContentId(id);
    setIsPreviewOpen(true);
    // Implement preview functionality
    toast.info('Content preview coming soon', {
      duration: 3000,
      closeButton: true,
    });
  };

  const handleSaveContent = async (updates: Partial<ContentItemType>) => {
    if (!selectedContentId) return;
    
    try {
      await updateContentItem(selectedContentId, updates);
      toast.success('Content updated successfully', {
        duration: 3000,
        closeButton: true,
      });
    } catch (error) {
      toast.error('Failed to update content', {
        duration: 5000,
        closeButton: true,
      });
      throw error; // Re-throw so the dialog can handle it
    }
  };

  const handleAnalyzeContent = (id: string) => {
    navigate(`/analytics?content=${id}`);
  };

  const handlePublishContent = async (id: string) => {
    try {
      await updateContentItem(id, { status: 'published' });
      toast.success('Content published successfully', {
        duration: 3000,
        closeButton: true,
      });
    } catch (error) {
      toast.error('Failed to publish content', {
        duration: 5000,
        closeButton: true,
      });
    }
  };

  const handleArchiveContent = async (id: string) => {
    try {
      await updateContentItem(id, { status: 'archived' });
      toast.success('Content archived successfully', {
        duration: 3000,
        closeButton: true,
      });
    } catch (error) {
      toast.error('Failed to archive content', {
        duration: 5000,
        closeButton: true,
      });
    }
  };

  const handleDeleteContent = (id: string) => {
    setSelectedContentId(id);
    setIsDeleteDialogOpen(true);
  };

  // Enhanced delete confirmation function with refresh mechanism
  const confirmDelete = useCallback(async () => {
    if (!selectedContentId || isDeleting) return;
    
    try {
      // 1. Set deleting state to prevent multiple clicks
      setIsDeleting(true);
      
      // 2. Find a new item to select after deletion - do this before closing dialog
      const remainingItems = contentItems.filter(item => item.id !== selectedContentId);
      const newSelectedId = remainingItems.length > 0 ? remainingItems[0].id : null;
      
      // 3. Store current ID for reference
      const deletedItemId = selectedContentId;
      
      // 4. Close dialog immediately to improve UI responsiveness
      setIsDeleteDialogOpen(false);
      
      // 5. Update selection before actual deletion to avoid reference issues
      setSelectedContentId(newSelectedId);
      
      // 6. Show deletion in progress toast
      const toastId = toast.loading('Deleting content...', {
        duration: 5000,
      });
      
      // 7. Perform the actual deletion
      await deleteContentItem(deletedItemId);
      
      // 8. Update toast to success
      toast.success('Content deleted successfully', {
        id: toastId,
        duration: 3000,
      });
    } catch (error) {
      // If error occurs, show error toast
      toast.error('Failed to delete content', {
        duration: 5000,
        closeButton: true,
      });
      console.error('Delete error:', error);
      
      // Reopen dialog if deletion failed
      if (selectedContentId) {
        setTimeout(() => {
          setIsDeleteDialogOpen(true);
        }, 500);
      }
    } finally {
      // Always reset the deleting state
      setIsDeleting(false);
    }
  }, [selectedContentId, isDeleting, contentItems, deleteContentItem]);

  return {
    selectedContentId,
    setSelectedContentId,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isPreviewOpen,
    setIsPreviewOpen,
    isDeleting,
    actions: {
      handleSelectContent,
      handleEditContent,
      handlePreviewContent,
      handleSaveContent,
      handleAnalyzeContent,
      handlePublishContent,
      handleArchiveContent,
      handleDeleteContent,
      confirmDelete
    }
  };
}
