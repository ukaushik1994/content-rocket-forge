
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { 
  extractDocumentStructure, 
  generateMetaSuggestions,
  analyzeSolutionIntegration,
  detectCTAs
} from '@/utils/seo/documentAnalysis';
import { calculateKeywordUsage } from '@/utils/seo/keywordAnalysis';
import { toast } from 'sonner';

export const useFinalReview = () => {
  const { state, dispatch } = useContentBuilder();
  const { content, mainKeyword, selectedKeywords, contentTitle, selectedSolution, serpSelections } = state;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordUsage, setKeywordUsage] = useState<{ keyword: string; count: number; density: string }[]>([]);
  const [ctaInfo, setCTAInfo] = useState<{ hasCTA: boolean; ctaText: string[] }>({ hasCTA: false, ctaText: [] });
  
  // Run document structure analysis when the content changes
  useEffect(() => {
    if (content) {
      // Extract document structure
      const structure = extractDocumentStructure(content);
      dispatch({ type: 'SET_DOCUMENT_STRUCTURE', payload: structure });
      
      // Analyze keyword usage
      const usage = calculateKeywordUsage(content, mainKeyword, selectedKeywords);
      setKeywordUsage(usage);
      
      // Detect CTAs
      const cta = detectCTAs(content);
      setCTAInfo(cta);
    }
  }, [content, mainKeyword, selectedKeywords, dispatch]);
  
  // Sync selected keywords from SERP selections
  useEffect(() => {
    if (serpSelections && serpSelections.length > 0) {
      // Extract selected keywords from SERP selections
      const selectedKeywordsFromSelections = serpSelections
        .filter(item => item.selected && item.type === 'keyword')
        .map(item => item.content);
      
      // Add selected keywords to state if they don't already exist
      if (selectedKeywordsFromSelections.length > 0) {
        const newKeywords = selectedKeywordsFromSelections.filter(
          keyword => !selectedKeywords.includes(keyword) && keyword !== mainKeyword
        );
        
        if (newKeywords.length > 0) {
          const updatedKeywords = [...selectedKeywords, ...newKeywords];
          dispatch({ type: 'SET_KEYWORDS', payload: updatedKeywords });
        }
      }
    }
  }, [serpSelections, mainKeyword, selectedKeywords, dispatch]);
  
  // Generate meta information
  const generateMeta = () => {
    if (!content) {
      toast.error('No content available to generate meta information');
      return;
    }
    
    const { metaTitle, metaDescription } = generateMetaSuggestions(content, mainKeyword, contentTitle);
    
    dispatch({ type: 'SET_META_TITLE', payload: metaTitle });
    dispatch({ type: 'SET_META_DESCRIPTION', payload: metaDescription });
    
    toast.success('Generated meta title and description');
  };
  
  // Analyze solution integration
  const analyzeSolutionUsage = () => {
    if (!content || !selectedSolution) {
      toast.error('Content or solution not available for analysis');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const metrics = analyzeSolutionIntegration(content, selectedSolution);
      dispatch({ type: 'SET_SOLUTION_INTEGRATION_METRICS', payload: metrics });
      toast.success('Solution integration analysis completed');
    } catch (error) {
      console.error('Error analyzing solution integration:', error);
      toast.error('Failed to analyze solution integration');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Check if we can mark the step as complete
  const checkStepCompletion = () => {
    const { metaTitle, metaDescription, documentStructure } = state;
    
    if (metaTitle && metaDescription && documentStructure) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 6 });
      return true;
    }
    
    return false;
  };
  
  return {
    isAnalyzing,
    keywordUsage,
    ctaInfo,
    generateMeta,
    analyzeSolutionUsage,
    checkStepCompletion
  };
};
