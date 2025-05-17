
import React from 'react';
import { Button } from '@/components/ui/button';
import { History, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { ThumbsUp, AlertCircle } from 'lucide-react';

interface ActionButtonsProps {
  content: ContentItemType;
  editedContent: string;
  editedTitle: string;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  content,
  editedContent,
  editedTitle,
  isSubmitting,
  setIsSubmitting
}) => {
  const { updateContentItem, publishContent } = useContent();
  
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateContentItem(content.id, { 
        content: editedContent,
        title: editedTitle 
      });
      toast.success('Content saved successfully', {
        icon: <ThumbsUp className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      toast.error('Failed to save content', {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await publishContent(content.id);
      toast.success('Content approved and published successfully', {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      toast.error('Failed to approve content', {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2 mt-3 md:mt-0">
      <Button 
        variant="outline" 
        onClick={handleSave} 
        disabled={isSubmitting}
        className="bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
      >
        <History className="mr-2 h-4 w-4" />
        Save Draft
      </Button>
      <Button 
        onClick={handleApprove} 
        disabled={isSubmitting}
        className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple shadow-md shadow-neon-purple/20"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Approve & Publish
      </Button>
    </div>
  );
};
