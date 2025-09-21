import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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
  content,
}) => {
  const [editedTitle, setEditedTitle] = useState(content?.title || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateContentItem } = useContent();
  const { improveContentWithAI, isImproving } = useApproval();

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[85vw] h-[85vh] max-w-[85vw] max-h-[85vh] p-0 border-none overflow-hidden rounded-lg">
        <div className="h-full bg-background flex">
          
          {/* Minimal Header */}
          <div className="flex-1 flex flex-col">
            <div className="flex-shrink-0 border-b border-border bg-card/50 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Review & Edit</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content Editor - 70% width */}
            <div className="flex-1 overflow-y-auto">
              <ContentApprovalEditor 
                content={content} 
                hideToolsToggle={true}
                defaultShowSidebar={false}
              />
            </div>
          </div>

          {/* Compact Editing Sidebar - 30% width */}
          <CompactEditingSidebar
            content={content}
            editedTitle={editedTitle}
            onTitleChange={setEditedTitle}
            onSave={handleSave}
            onImprove={handleImprove}
            isSubmitting={isSubmitting}
            isImproving={isImproving}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};