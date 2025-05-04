
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ContentItemType } from '@/contexts/content';
import { ContentEditForm } from './ContentEditForm';

interface ContentEditDialogProps {
  open: boolean;
  content: ContentItemType | null;
  onOpenChange: (open: boolean) => void;
  onSave: (values: Partial<ContentItemType>) => Promise<void>;
}

type FormValues = {
  title: string;
  content: string;
  keywords: string;
};

export const ContentEditDialog: React.FC<ContentEditDialogProps> = ({
  open,
  content,
  onOpenChange,
  onSave
}) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSubmit = async (values: FormValues) => {
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
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Content</DialogTitle>
        </DialogHeader>
        
        <ContentEditForm 
          content={content}
          isSaving={isSaving}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};
