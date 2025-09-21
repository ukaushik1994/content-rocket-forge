import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { ContentApprovalEditor } from '@/components/approval/ContentApprovalEditor';

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
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 border-none overflow-hidden">
        <div className="h-full bg-background flex flex-col">
          
          {/* Compact Header */}
          <div className="flex-shrink-0 border-b border-border bg-card/50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Review & Edit</h2>
                <p className="text-xs text-muted-foreground line-clamp-1">{content.title}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <ContentApprovalEditor 
              content={content} 
              hideToolsToggle={false}
              defaultShowSidebar={true}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};