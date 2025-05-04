
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ContentItemType } from '@/contexts/content';
import { EnhancedContentEditForm } from './EnhancedContentEditForm';

interface ContentEditDialogProps {
  open: boolean;
  content: ContentItemType | null;
  onOpenChange: (open: boolean) => void;
  onSave: (values: Partial<ContentItemType>) => Promise<void>;
}

export const ContentEditDialog: React.FC<ContentEditDialogProps> = ({
  open,
  content,
  onOpenChange,
  onSave
}) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSubmit = async (values: { title: string; content: string; keywords: string }) => {
    try {
      setIsSaving(true);
      
      // Process keywords into array
      const keywordsArray = values.keywords
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);
        
      await onSave({
        title: values.title,
        content: values.content,
        keywords: keywordsArray
      });
      
      toast.success('Content updated successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to save content: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-4 pb-2">
          <DialogTitle>Edit Content</DialogTitle>
        </DialogHeader>
        
        <EnhancedContentEditForm 
          content={content}
          isSaving={isSaving}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};
