
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { useContent } from '@/contexts/content';
import { toast } from 'sonner';

interface StatusActionsProps {
  selectedContent: ContentItemType | null;
}

export const StatusActions: React.FC<StatusActionsProps> = ({ selectedContent }) => {
  const { updateContentItem, publishContent } = useContent();

  const handleApprove = async () => {
    if (!selectedContent) return;
    
    try {
      await updateContentItem(selectedContent.id, { 
        status: 'approved',
        updated_at: new Date().toISOString()
      });
      toast.success('Content approved successfully');
    } catch (error) {
      console.error('Error approving content:', error);
      toast.error('Failed to approve content');
    }
  };

  const handlePublish = async () => {
    if (!selectedContent) return;
    
    try {
      await publishContent(selectedContent.id);
      toast.success('Content published successfully');
    } catch (error) {
      console.error('Error publishing content:', error);
      toast.error('Failed to publish content');
    }
  };

  if (!selectedContent) return null;
  
  switch(selectedContent.status) {
    case 'draft':
      return (
        <Button 
          onClick={handleApprove}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Approve Content
        </Button>
      );
    case 'approved':
      return (
        <Button 
          onClick={handlePublish}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Publish Content
        </Button>
      );
    default:
      return null;
  }
};
