
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { toast } from 'sonner';

export const useContentSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getContentItem } = useContent();
  
  const [content, setContent] = useState<ContentItemType | null>(null);
  
  // Load content when component mounts
  useEffect(() => {
    // Check if we have a specific content ID from URL param
    const contentId = new URLSearchParams(location.search).get('id');
    if (contentId) {
      const contentItem = getContentItem(contentId);
      if (contentItem) {
        console.log('Loaded content for repurposing:', contentItem.title);
        setContent(contentItem);
      } else {
        toast.error('Content not found');
      }
    }
  }, [location, getContentItem]);
  
  const handleContentSelection = (contentId: string) => {
    const selectedContent = getContentItem(contentId);
    if (selectedContent) {
      setContent(selectedContent);
      // Update the URL without page reload
      navigate(`/content-repurposing?id=${contentId}`, { replace: true });
    }
  };
  
  // Add a resetContent function to clear the selected content and reset the URL
  const resetContent = () => {
    setContent(null);
    navigate('/content-repurposing', { replace: true });
  };
  
  return {
    content,
    handleContentSelection,
    resetContent, // Export the new resetContent function
  };
};
