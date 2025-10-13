import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ContentItemType } from '@/contexts/content/types';
import { ContentApprovalEditor } from '@/components/approval/ContentApprovalEditor';
import { CompactEditingSidebar } from './CompactEditingSidebar';
import { useContent } from '@/contexts/content';
import { useApproval } from '../context/ApprovalContext';
import { toast } from 'sonner';
interface ReviewEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItemType | null;
}
export const ReviewEditorModal: React.FC<ReviewEditorModalProps> = ({
  isOpen,
  onClose,
  content
}) => {
  const [editedTitle, setEditedTitle] = useState(content?.title || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Sync editedTitle with content changes
  useEffect(() => {
    if (content?.title) {
      setEditedTitle(content.title);
    }
  }, [content?.title]);
  const {
    updateContentItem,
    approveContent
  } = useContent();
  const {
    improveContentWithAI,
    isImproving
  } = useApproval();
  if (!content) return null;
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateContentItem(content.id, {
        title: editedTitle
      });
      toast.success('Content saved successfully');
    } catch (error) {
      toast.error('Failed to save content');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleImprove = async () => {
    try {
      const improvedContent = await improveContentWithAI(content);
      if (improvedContent) {
        toast.success('Content improved with AI assistance');
      }
    } catch (error) {
      toast.error('Failed to improve content');
      console.error(error);
    }
  };
  const handleApprove = async () => {
    if (!content) return;
    setIsSubmitting(true);
    try {
      await approveContent(content.id, approvalNotes || undefined);
      toast.success('Content approved successfully');
    } catch (error) {
      toast.error('Failed to approve content');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[85vw] h-[85vh] max-w-[85vw] max-h-[85vh] p-0 border-none overflow-hidden rounded-lg">
        <div className="h-full bg-background flex">
          
          {/* Minimal Header */}
          <div className="flex-1 flex flex-col">
            

            {/* Content Editor - 70% width */}
            <div className="flex-1 overflow-y-auto">
              <ContentApprovalEditor content={content} hideToolsToggle={true} defaultShowSidebar={false} />
            </div>
          </div>

          {/* Compact Editing Sidebar - 30% width */}
          <CompactEditingSidebar content={content} editedTitle={editedTitle} onTitleChange={setEditedTitle} onSave={handleSave} onImprove={handleImprove} isSubmitting={isSubmitting} isImproving={isImproving} approvalNotes={approvalNotes} setApprovalNotes={setApprovalNotes} onApprove={handleApprove} onTitleSelect={(title: string) => setEditedTitle(title)} onSectionRegenerated={(updatedContent: string) => {
          // Update content logic would go here
          console.log('Section regenerated:', updatedContent);
        }} />
        </div>
      </DialogContent>
    </Dialog>;
};