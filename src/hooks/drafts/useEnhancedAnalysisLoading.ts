
import { useState, useEffect, useCallback, useRef } from 'react';
import { DraftDataTransformer, TransformedDraftData } from '@/services/DraftDataTransformer';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { extractDocumentStructure } from '@/utils/seo/document/extractDocumentStructure';
import { analyzeSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';
import { calculateKeywordUsage } from '@/utils/seo/keywordAnalysis';
import { validateDraftData } from '@/utils/validation/dataValidation';
import { toast } from 'sonner';

interface UseEnhancedAnalysisLoadingProps {
  draft: any;
  activeTab: string;
}

export const useEnhancedAnalysisLoading = ({ draft, activeTab }: UseEnhancedAnalysisLoadingProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [transformedData, setTransformedData] = useState<TransformedDraftData | null>(null);
  const [analysisData, setAnalysisData] = useState({
    serpData: null,
    documentStructure: null,
    solutionMetrics: null,
    keywordUsage: []
  });
  
  const loadedTabs = useRef(new Set<string>());
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Transform draft data on draft change
  useEffect(() => {
    if (draft) {
      try {
        const transformed = DraftDataTransformer.transform(draft);
        setTransformedData(transformed);
        
        // Update analysis data with transformed data
        setAnalysisData({
          serpData: transformed.serpData,
          documentStructure: transformed.documentStructure,
          solutionMetrics: transformed.solutionMetrics,
          keywordUsage: transformed.keywordUsage
        });
      } catch (error) {
        console.error('Error transforming draft data:', error);
        setAnalysisError('Failed to process draft data');
      }
    }
  }, [draft?.id, draft?.metadata, draft?.content]);
  
  const loadAnalysisForTab = useCallback(async (tabName: string) => {
    if (!draft || loadedTabs.current.has(tabName)) {
      return;
    }
    
    // Validate draft data first
    const draftValidation = validateDraftData(draft);
    if (!draftValidation.isValid) {
      setAnalysisError(`Draft validation failed: ${draftValidation.errors.join(', ')}`);
      return;
    }
    
    // Cancel any ongoing analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const currentData = transformedData || DraftDataTransformer.transform(draft);
      let needsUpdate = false;
      let newAnalysisData = { ...analysisData };
      
      // Only run fresh analysis if we don't have the required data
      if (tabName === 'seo' && !currentData.serpData && currentData.keywords.length > 0) {
        try {
          const mainKeyword = currentData.keywords[0];
          if (mainKeyword && typeof mainKeyword === 'string') {
            const serpAnalysis = await analyzeKeywordSerp(mainKeyword);
            newAnalysisData.serpData = serpAnalysis;
            needsUpdate = true;
          }
        } catch (error) {
          console.warn('Failed to analyze SERP data:', error);
        }
      }
      
      // Generate document structure if missing
      if ((tabName === 'analytics' || tabName === 'structure') && !currentData.documentStructure && draft.content) {
        try {
          const structure = extractDocumentStructure(draft.content);
          newAnalysisData.documentStructure = structure;
          needsUpdate = true;
        } catch (error) {
          console.warn('Failed to extract document structure:', error);
        }
      }
      
      // Generate solution metrics if missing
      if (tabName === 'structure' && !currentData.solutionMetrics && draft.metadata?.selectedSolution) {
        try {
          const solutionAnalysis = analyzeSolutionIntegration(draft.content, draft.metadata.selectedSolution);
          newAnalysisData.solutionMetrics = solutionAnalysis;
          needsUpdate = true;
        } catch (error) {
          console.warn('Failed to analyze solution integration:', error);
        }
      }
      
      // Generate keyword usage if missing
      if (!currentData.keywordUsage.length && currentData.keywords.length > 0 && draft.content) {
        try {
          const mainKeyword = currentData.keywords[0];
          const selectedKeywords = currentData.keywords.slice(1);
          const keywordUsage = calculateKeywordUsage(draft.content, mainKeyword, selectedKeywords);
          newAnalysisData.keywordUsage = keywordUsage;
          needsUpdate = true;
        } catch (error) {
          console.warn('Failed to calculate keyword usage:', error);
        }
      }
      
      if (needsUpdate) {
        setAnalysisData(newAnalysisData);
      }
      
      loadedTabs.current.add(tabName);
      
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error loading analysis for tab:', tabName, error);
        setAnalysisError(error.message || 'Failed to load analysis data');
        toast.error(`Analysis failed for ${tabName} tab`);
      }
    } finally {
      setIsAnalyzing(false);
      abortControllerRef.current = null;
    }
  }, [draft, transformedData, analysisData]);
  
  // Load analysis when active tab changes
  useEffect(() => {
    if (activeTab && ['analytics', 'seo', 'structure'].includes(activeTab)) {
      loadAnalysisForTab(activeTab);
    }
  }, [activeTab, loadAnalysisForTab]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  const retryAnalysis = useCallback(() => {
    if (activeTab) {
      loadedTabs.current.delete(activeTab);
      loadAnalysisForTab(activeTab);
    }
  }, [activeTab, loadAnalysisForTab]);
  
  const resetAnalysis = useCallback(() => {
    loadedTabs.current.clear();
    setAnalysisData({
      serpData: null,
      documentStructure: null,
      solutionMetrics: null,
      keywordUsage: []
    });
    setAnalysisError(null);
    setTransformedData(null);
  }, []);
  
  return {
    isAnalyzing,
    analysisError,
    analysisData: transformedData ? {
      serpData: transformedData.serpData || analysisData.serpData,
      documentStructure: transformedData.documentStructure || analysisData.documentStructure,
      solutionMetrics: transformedData.solutionMetrics || analysisData.solutionMetrics,
      keywordUsage: transformedData.keywordUsage.length > 0 ? transformedData.keywordUsage : analysisData.keywordUsage
    } : analysisData,
    transformedData,
    retryAnalysis,
    resetAnalysis
  };
};
