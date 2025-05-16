
import { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
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
      try {
        // Extract document structure
        const structure = extractDocumentStructure(content);
        
        // Ensure we have default values for all required properties
        const safeStructure = {
          h1: [],
          h2: [],
          h3: [],
          h4: [],
          h5: [],
          h6: [],
          hasSingleH1: false,
          hasLogicalHierarchy: false,
          headings: [],
          headingCounts: {
            h1: 0,
            h2: 0,
            h3: 0,
            h4: 0,
            h5: 0,
            h6: 0
          },
          paragraphs: [],
          lists: [],
          images: [],
          links: [],
          metadata: {
            wordCount: 0,
            characterCount: 0
          },
          ...structure // This will override defaults with actual values
        };
        
        // DocumentStructure object already has the correct structure from documentAnalysis.ts now
        dispatch({ type: 'SET_DOCUMENT_STRUCTURE', payload: safeStructure });
      } catch (error) {
        console.error("Error analyzing document structure:", error);
        // If there's an error, set a safe default structure
        dispatch({
          type: 'SET_DOCUMENT_STRUCTURE',
          payload: {
            h1: [],
            h2: [],
            h3: [],
            h4: [],
            h5: [],
            h6: [],
            hasSingleH1: false,
            hasLogicalHierarchy: false,
            headings: [],
            headingCounts: {
              h1: 0,
              h2: 0,
              h3: 0,
              h4: 0,
              h5: 0,
              h6: 0
            },
            paragraphs: [],
            lists: [],
            images: [],
            links: [],
            metadata: {
              wordCount: 0,
              characterCount: 0
            }
          }
        });
      }
    }
  }, [content, dispatch]);

  return {
    documentStructure: state.documentStructure
  };
};
