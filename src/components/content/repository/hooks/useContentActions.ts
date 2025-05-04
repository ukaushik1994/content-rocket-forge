
import { useState } from 'react';
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

  const confirmDelete = async () => {
    if (!selectedContentId || isDeleting) return;
    
    try {
      // Mark as deleting to prevent multiple clicks
      setIsDeleting(true);
      
      // First, close the dialog to avoid UI freezes
      setIsDeleteDialogOpen(false);
      
      // Store ID for reference
      const deletedItemId = selectedContentId;
      
      // Find a new item to select after deletion
      const remainingItems = contentItems.filter(item => item.id !== deletedItemId);
      const newSelectedId = remainingItems.length > 0 ? remainingItems[0].id : null;
      
      // Update selection before actual deletion to avoid reference issues
      setSelectedContentId(newSelectedId);
      
      // Then perform the actual deletion
      await deleteContentItem(deletedItemId);
      
      toast.success('Content deleted successfully', {
        duration: 3000,
        closeButton: true,
      });
    } catch (error) {
      toast.error('Failed to delete content', {
        duration: 5000,
        closeButton: true,
      });
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

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
