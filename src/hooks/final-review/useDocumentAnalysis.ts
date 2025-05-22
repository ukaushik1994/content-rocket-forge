
import { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { extractDocumentStructure } from '@/utils/seo/document/extractDocumentStructure';

/**
 * Custom hook for document structure analysis
 */
export const useDocumentAnalysis = () => {
  const { state, dispatch } = useContentBuilder();
  
  // Analyze document structure for proper heading hierarchy
  const analyzeDocumentStructure = useCallback(async (content: string) => {
    if (!content) return null;
    
    try {
      // Use the extractDocumentStructure utility to parse the document
      const documentStructure = extractDocumentStructure(content);
      
      dispatch({ 
        type: 'SET_DOCUMENT_STRUCTURE', 
        payload: documentStructure 
      });
      
      return documentStructure;
    } catch (error) {
      console.error("Error analyzing document structure:", error);
      return null;
    }
  }, [dispatch]);
  
  return {
    documentStructure: state.documentStructure,
    analyzeDocumentStructure
  };
};
