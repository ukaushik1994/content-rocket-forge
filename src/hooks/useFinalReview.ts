
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { 
  extractDocumentStructure, 
  generateMetaSuggestions,
  analyzeSolutionIntegration,
  detectCTAs,
  generateTitleSuggestions
} from '@/utils/seo/documentAnalysis';
import { calculateKeywordUsage } from '@/utils/seo/keywordAnalysis';
import { toast } from 'sonner';

// Standard toast configuration
const toastConfig = {
  success: { duration: 3000, closeButton: true },
  error: { duration: 5000, closeButton: true },
  info: { duration: 4000, closeButton: true }
};

export const useFinalReview = () => {
  const { state, dispatch } = useContentBuilder();
  const { 
    content, 
    mainKeyword, 
    selectedKeywords, 
    contentTitle, 
    selectedSolution, 
    serpSelections,
    serpData
  } = state;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [keywordUsage, setKeywordUsage] = useState<{ keyword: string; count: number; density: string }[]>([]);
  const [ctaInfo, setCTAInfo] = useState<{ hasCTA: boolean; ctaText: string[] }>({ hasCTA: false, ctaText: [] });
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  
  // Run document structure analysis when the content changes
  useEffect(() => {
    if (content) {
      // Extract document structure
      const structure = extractDocumentStructure(content);
      
      // DocumentStructure object already has the correct structure from documentAnalysis.ts now
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
      toast.error('No content available to generate meta information', toastConfig.error);
      return;
    }
    
    const { metaTitle, metaDescription } = generateMetaSuggestions(content, mainKeyword, contentTitle);
    
    dispatch({ type: 'SET_META_TITLE', payload: metaTitle });
    dispatch({ type: 'SET_META_DESCRIPTION', payload: metaDescription });
    
    toast.success('Generated meta title and description', toastConfig.success);
    
    // Also generate title suggestions
    generateTitleSuggestionsAsync();
  };
  
  // Generate title suggestions
  const generateTitleSuggestionsAsync = async () => {
    if (!content || !mainKeyword) {
      toast.error('Content or main keyword not available for generating titles', toastConfig.error);
      return;
    }
    
    setIsGeneratingTitles(true);
    
    try {
      // Call the generateTitleSuggestions function from documentAnalysis
      const suggestions = await generateTitleSuggestions(content, mainKeyword, selectedKeywords);
      
      setTitleSuggestions(suggestions);
      toast.success('Generated title suggestions', toastConfig.success);
    } catch (error) {
      console.error('Error generating title suggestions:', error);
      toast.error('Failed to generate title suggestions', toastConfig.error);
    } finally {
      setIsGeneratingTitles(false);
    }
  };
  
  // Analyze solution integration
  const analyzeSolutionUsage = () => {
    if (!content || !selectedSolution) {
      toast.error('Content or solution not available for analysis', toastConfig.error);
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const metrics = analyzeSolutionIntegration(content, selectedSolution);
      
      // SolutionIntegrationMetrics object is now compatible with the expected type
      const solutionMetrics = {
        featureIncorporation: metrics.featureIncorporation,
        positioningScore: metrics.positioningScore,
        nameMentions: metrics.nameMentions,
        painPointsAddressed: metrics.painPointsAddressed,
        audienceAlignment: metrics.audienceAlignment,
        ctaMentions: ctaInfo.ctaText.length,
        overallScore: Math.round((metrics.featureIncorporation + metrics.positioningScore) / 2)
      };
      
      dispatch({ type: 'SET_SOLUTION_INTEGRATION_METRICS', payload: solutionMetrics });
      toast.success('Solution integration analysis completed', toastConfig.success);
    } catch (error) {
      console.error('Error analyzing solution integration:', error);
      toast.error('Failed to analyze solution integration', toastConfig.error);
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
    isGeneratingTitles,
    keywordUsage,
    ctaInfo,
    titleSuggestions,
    serpData,
    generateMeta,
    generateTitleSuggestions: generateTitleSuggestionsAsync,
    analyzeSolutionUsage,
    checkStepCompletion
  };
};
