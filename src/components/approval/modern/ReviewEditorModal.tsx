import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { ContentApprovalEditor } from '@/components/approval/ContentApprovalEditor';
import { CompactEditingSidebar } from './CompactEditingSidebar';
import { useContent } from '@/contexts/content';
import { useApproval } from '../context/ApprovalContext';
import { toast } from 'sonner';
import { useSmartApprovalRecommendation } from '@/hooks/approval/useSmartApprovalRecommendation';
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
    approveContent,
    rejectContent,
    requestChanges,
    submitForReview
  } = useContent();
  const {
    improveContentWithAI,
    isImproving
  } = useApproval();
  const mainKeyword = (content?.metadata?.mainKeyword || content?.keywords?.[0] || '').toString().trim();
  const {
    recommendation
  } = useSmartApprovalRecommendation({
    content,
    editedContent: content?.content || '',
    editedTitle,
    mainKeyword,
    notes: approvalNotes
  });
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
  const handleReject = async () => {
    if (!content || !approvalNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setIsSubmitting(true);
    try {
      await rejectContent(content.id, approvalNotes);
      toast.success('Content rejected with feedback');
    } catch (error) {
      toast.error('Failed to reject content');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleRequestChanges = async () => {
    if (!content || !approvalNotes.trim()) {
      toast.error('Please provide specific change requests');
      return;
    }
    setIsSubmitting(true);
    try {
      await requestChanges(content.id, approvalNotes);
      toast.success('Change request sent');
    } catch (error) {
      toast.error('Failed to request changes');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSubmitForReview = async () => {
    if (!content) return;
    setIsSubmitting(true);
    try {
      await submitForReview(content.id, approvalNotes || undefined);
      toast.success('Content submitted for review');
    } catch (error) {
      toast.error('Failed to submit for review');
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
          <CompactEditingSidebar content={content} editedTitle={editedTitle} onTitleChange={setEditedTitle} onSave={handleSave} onImprove={handleImprove} isSubmitting={isSubmitting} isImproving={isImproving} recommendation={recommendation} approvalNotes={approvalNotes} setApprovalNotes={setApprovalNotes} onApprove={handleApprove} onRequestChanges={handleRequestChanges} onReject={handleReject} onSubmitForReview={handleSubmitForReview} onTitleSelect={(title: string) => setEditedTitle(title)} onSectionRegenerated={(updatedContent: string) => {
          // Update content logic would go here
          console.log('Section regenerated:', updatedContent);
        }} />
        </div>
      </DialogContent>
    </Dialog>;
};