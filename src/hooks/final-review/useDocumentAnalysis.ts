import { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { extractDocumentStructure } from '@/utils/seo/document/extractDocumentStructure';

/**
 * Custom hook for analyzing document structure
 */
export const useDocumentAnalysis = () => {
  const { state, dispatch } = useContentBuilder();
  const { content } = state;
  
  // Run document structure analysis when the content changes
  useEffect(() => {
    if (content) {
      // Extract document structure
      const structure = extractDocumentStructure(content);
      
      // DocumentStructure object already has the correct structure from documentAnalysis.ts now
      dispatch({ type: 'SET_DOCUMENT_STRUCTURE', payload: structure });
    }
  }, [content, dispatch]);

  return {
    documentStructure: state.documentStructure
  };
};
