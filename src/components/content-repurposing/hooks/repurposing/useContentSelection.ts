
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
  const [loadedContentId, setLoadedContentId] = useState<string | null>(null);
  
  // Load content when component mounts or URL changes
  useEffect(() => {
    // Check if we have a specific content ID from URL param
    const contentId = new URLSearchParams(location.search).get('id');
    
    // Prevent duplicate loading of the same content
    if (contentId && contentId !== loadedContentId) {
      console.log('Loading content for repurposing with ID:', contentId);
      const contentItem = getContentItem(contentId);
      
      if (contentItem) {
        console.log('Loaded content for repurposing:', contentItem.title);
        setContent(contentItem);
        setLoadedContentId(contentId);
      } else {
        toast.error('Content not found');
      }
    }
  }, [location, getContentItem, loadedContentId]);
  
  const handleContentSelection = (contentItem: ContentItemType) => {
    // Check if it's the same content we already have loaded
    if (contentItem.id === loadedContentId) {
      console.log('Content already selected, skipping');
      return;
    }
    
    setContent(contentItem);
    setLoadedContentId(contentItem.id);
    // Update the URL without page reload
    navigate(`/content-repurposing?id=${contentItem.id}`, { replace: true });
  };
  
  const resetContent = () => {
    setContent(null);
    setLoadedContentId(null);
    navigate('/content-repurposing', { replace: true });
  };
  
  return {
    content,
    handleContentSelection,
    resetContent,
  };
};
