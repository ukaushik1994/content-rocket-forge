
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
  
  const { updateContentItem, deleteContentItem } = useContent();
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
    if (!selectedContentId) return;
    
    try {
      // Store deleted item ID for reference
      const deletedItemId = selectedContentId;
      
      // Close dialog and reset state immediately
      setIsDeleteDialogOpen(false);
      setSelectedContentId(null);
      
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
