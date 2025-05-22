
import { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

/**
 * Custom hook for document structure analysis
 */
export const useDocumentAnalysis = () => {
  const { state, dispatch } = useContentBuilder();
  
  // Analyze document structure for proper heading hierarchy
  const analyzeDocumentStructure = useCallback(async (content: string) => {
    if (!content) return null;
    
    try {
      // Parse document to check H1 and heading hierarchy
      const headings: { level: number, text: string }[] = [];
      const lines = content.split('\n');
      
      // Extract all headings
      lines.forEach(line => {
        const h1Match = line.match(/^# (.+)/);
        const h2Match = line.match(/^## (.+)/);
        const h3Match = line.match(/^### (.+)/);
        const h4Match = line.match(/^#### (.+)/);
        const h5Match = line.match(/^##### (.+)/);
        const h6Match = line.match(/^###### (.+)/);
        
        if (h1Match) headings.push({ level: 1, text: h1Match[1] });
        else if (h2Match) headings.push({ level: 2, text: h2Match[1] });
        else if (h3Match) headings.push({ level: 3, text: h3Match[1] });
        else if (h4Match) headings.push({ level: 4, text: h4Match[1] });
        else if (h5Match) headings.push({ level: 5, text: h5Match[1] });
        else if (h6Match) headings.push({ level: 6, text: h6Match[1] });
      });
      
      // Check for single H1
      const h1Count = headings.filter(h => h.level === 1).length;
      const hasSingleH1 = h1Count === 1;
      
      // Check heading hierarchy
      let hasLogicalHierarchy = true;
      let previousLevel = 0;
      
      for (const heading of headings) {
        // A heading can be at most one level deeper than the previous heading
        if (heading.level > previousLevel + 1) {
          hasLogicalHierarchy = false;
          break;
        }
        previousLevel = heading.level;
      }
      
      // Update state with structure info
      const documentStructure = {
        hasSingleH1,
        hasLogicalHierarchy,
        headings
      };
      
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
