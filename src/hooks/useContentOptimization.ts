
import { useState, useCallback, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { SeoImprovement } from '@/contexts/content-builder/types/seo-types';

export const useContentOptimization = () => {
  const { state, analyzeSeo, applySeoImprovement, skipOptimizationStep } = useContentBuilder();
  const { content, seoScore, seoImprovements, seoAnalysisResults, seoOptimizationMetrics, isAnalyzing } = state;
  
  const [hasRunAnalysis, setHasRunAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Scores with default values
  const scores = seoAnalysisResults || { 
    keywordScore: 0, 
    readabilityScore: 0, 
    contentLengthScore: 0,
    structureScore: 0
  };
  
  // Helper function to get color based on score
  const getScoreColor = useCallback((score: number): string => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'yellow';
    return 'red';
  }, []);
  
  // Get all improvements
  const improvements: SeoImprovement[] = seoImprovements || [];
  
  // Check if an improvement has been applied
  const isImprovementApplied = useCallback((id: string): boolean => {
    return seoImprovements.some(improvement => improvement.id === id && improvement.applied);
  }, [seoImprovements]);
  
  // Run SEO analysis
  const runSeoAnalysis = useCallback(async () => {
    if (!content || content.length < 100) {
      toast.error('Your content is too short for meaningful analysis');
      return;
    }
    
    try {
      setAnalysisError(null);
      const result = await analyzeSeo(content);
      
      if (result) {
        setHasRunAnalysis(true);
      } else {
        setAnalysisError('Analysis failed. Try again or skip this step.');
      }
    } catch (error) {
      console.error('Error running SEO analysis:', error);
      setAnalysisError('An error occurred during analysis. Try again or skip this step.');
    }
  }, [content, analyzeSeo]);
  
  // Handle improvement application
  const handleApplyImprovement = useCallback((recommendation: string, id: string) => {
    if (!id) return;
    
    // Apply the improvement
    applySeoImprovement(id);
    
    // Show success toast
    toast.success('Optimization applied successfully');
  }, [applySeoImprovement]);
  
  // Handle skip confirmation
  const handleSkipConfirm = useCallback(() => {
    if (hasRunAnalysis && seoScore > 0) {
      // User has run analysis but wants to skip optimizations
      skipOptimizationStep();
      toast.success('Optimization step completed');
    } else {
      // User wants to skip the entire step
      if (window.confirm('Skip SEO optimization? This may affect your content quality.')) {
        skipOptimizationStep();
        toast.success('Optimization step skipped');
      }
    }
  }, [hasRunAnalysis, seoScore, skipOptimizationStep]);
  
  // Force skip analysis
  const forceSkipAnalysis = useCallback(() => {
    skipOptimizationStep();
    toast.success('Continuing to next step');
  }, [skipOptimizationStep]);
  
  // Run analysis automatically on first render if content exists
  useEffect(() => {
    if (content && content.length >= 100 && seoScore === 0 && !isAnalyzing && !hasRunAnalysis) {
      runSeoAnalysis();
    }
  }, []);
  
  return {
    seoScore,
    improvements,
    scores,
    isAnalyzing,
    hasRunAnalysis,
    analysisError,
    optimizationMetrics: seoOptimizationMetrics,
    runSeoAnalysis,
    handleApplyImprovement,
    isImprovementApplied,
    getScoreColor,
    handleSkipConfirm,
    forceSkipAnalysis
  };
};
