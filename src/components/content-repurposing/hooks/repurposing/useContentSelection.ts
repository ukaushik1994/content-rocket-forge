
import { useState, useCallback } from 'react';
import { ContentItemType } from '@/contexts/content/types';

export const useContentSelection = () => {
  const [content, setContent] = useState<ContentItemType | null>(null);
  
  const handleContentSelection = useCallback((contentItem: ContentItemType) => {
    console.log('Selecting content for repurposing:', contentItem.title);
    setContent(contentItem);
  }, []);
  
  const resetContent = useCallback(() => {
    setContent(null);
  }, []);
  
  return {
    content,
    handleContentSelection,
    resetContent,
  };
};
