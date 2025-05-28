
import { useState, useEffect, useCallback, useRef } from 'react';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { extractDocumentStructure } from '@/utils/seo/document/extractDocumentStructure';
import { analyzeSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';
import { calculateKeywordUsage } from '@/utils/seo/keywordAnalysis';
import { validateDraftData, validateAnalysisData } from '@/utils/validation/dataValidation';
import { toast } from 'sonner';

interface UseSmartAnalysisLoadingProps {
  draft: any;
  activeTab: string;
}

export const useSmartAnalysisLoading = ({ draft, activeTab }: UseSmartAnalysisLoadingProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState({
    serpData: null,
    documentStructure: null,
    solutionMetrics: null,
    keywordUsage: []
  });
  
  const loadedTabs = useRef(new Set<string>());
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Stabilize draft properties
  const draftId = draft?.id;
  const draftContent = draft?.content;
  const draftKeywords = draft?.keywords;
  const draftSelectedSolution = draft?.metadata?.selectedSolution;
  
  const loadAnalysisForTab = useCallback(async (tabName: string) => {
    // Validate draft data first
    const draftValidation = validateDraftData(draft);
    if (!draftValidation.isValid) {
      setAnalysisError(`Draft validation failed: ${draftValidation.errors.join(', ')}`);
      return;
    }
    
    if (!draftContent || loadedTabs.current.has(tabName)) {
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
      let newAnalysisData = { ...analysisData };
      
      // Load basic analysis for all tabs
      if (tabName === 'analytics' || tabName === 'structure') {
        // Extract document structure (always works)
        const structure = extractDocumentStructure(draftContent);
        newAnalysisData.documentStructure = structure;
        
        // Calculate keyword usage if keywords available
        if (draftKeywords && Array.isArray(draftKeywords) && draftKeywords.length > 0) {
          try {
            const mainKeyword = draftKeywords[0];
            const selectedKeywords = draftKeywords.slice(1);
            const keywordUsage = calculateKeywordUsage(draftContent, mainKeyword, selectedKeywords);
            newAnalysisData.keywordUsage = keywordUsage;
          } catch (error) {
            console.warn('Failed to calculate keyword usage:', error);
          }
        }
      }
      
      // Load SERP analysis only for SEO tab
      if (tabName === 'seo' && draftKeywords && Array.isArray(draftKeywords) && draftKeywords.length > 0) {
        try {
          const mainKeyword = draftKeywords[0];
          if (mainKeyword && typeof mainKeyword === 'string') {
            const serpAnalysis = await analyzeKeywordSerp(mainKeyword);
            newAnalysisData.serpData = serpAnalysis;
          }
        } catch (error) {
          console.warn('Failed to analyze SERP data:', error);
        }
      }
      
      // Load solution analysis only for structure tab
      if (tabName === 'structure' && draftSelectedSolution) {
        try {
          const solutionAnalysis = analyzeSolutionIntegration(draftContent, draftSelectedSolution);
          newAnalysisData.solutionMetrics = solutionAnalysis;
        } catch (error) {
          console.warn('Failed to analyze solution integration:', error);
        }
      }
      
      // Validate analysis data before setting
      const analysisValidation = validateAnalysisData(newAnalysisData);
      if (!analysisValidation.isValid) {
        console.warn('Analysis data validation warnings:', analysisValidation.errors);
      }
      
      setAnalysisData(newAnalysisData);
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
  }, [draftContent, draftKeywords, draftSelectedSolution, draft, analysisData]);
  
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
  }, []);
  
  return {
    isAnalyzing,
    analysisError,
    analysisData,
    retryAnalysis,
    resetAnalysis
  };
};
