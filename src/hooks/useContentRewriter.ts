import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

export const useContentRewriter = () => {
  const { state, dispatch } = useContentBuilder();
  const [isRewriting, setIsRewriting] = useState(false);

  const rewriteContent = useCallback(async (newContent: string) => {
    setIsRewriting(true);
    try {
      dispatch({ type: 'SET_CONTENT', payload: newContent });
      toast.success('Content successfully rewritten!');
    } catch (error) {
      console.error('Error rewriting content:', error);
      toast.error('Failed to rewrite content.');
    } finally {
      setIsRewriting(false);
    }
  }, [dispatch]);

  return {
    isRewriting,
    rewriteContent,
  };
};

