import { useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useContentAnalysis } from '@/components/content-builder/final-review/optimization/hooks/useContentAnalysis';
import { useSolutionAnalysis } from '@/components/content-builder/final-review/optimization/hooks/useSolutionAnalysis';
import { useAIDetection } from '@/components/content-builder/final-review/optimization/hooks/useAIDetection';
import { useSerpIntegration } from '@/components/content-builder/final-review/optimization/hooks/useSerpIntegration';
import { analyzeEnhancedSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';

/**
 * Hook to capture comprehensive optimization metadata during content creation
 */
export const useMetadataCapture = () => {
  const { state } = useContentBuilder();
  const { contentSuggestions, analyzeContentQuality } = useContentAnalysis();
  const { solutionSuggestions, analyzedSolutionIntegration, analyzeSolution } = useSolutionAnalysis();
  const { aiDetectionSuggestions, analyzeAIContent } = useAIDetection();
  const { serpIntegrationSuggestions, analyzeSerpUsage } = useSerpIntegration();

  /**
   * Capture comprehensive optimization metadata for content
   */
  const captureOptimizationMetadata = useCallback(async (content: string) => {
    const optimizationData: any = {
      // Basic content analysis
      contentAnalysis: {
        suggestions: contentSuggestions,
        wordCount: content.split(' ').length,
        readingTime: Math.ceil(content.split(' ').length / 200),
        analysisTimestamp: new Date().toISOString()
      },

      // Solution integration analysis
      solutionAnalysis: null,
      solutionIntegrationMetrics: null,

      // AI content detection
      aiDetection: {
        suggestions: aiDetectionSuggestions,
        isAIContent: aiDetectionSuggestions.length > 0,
        humanizationRequired: aiDetectionSuggestions.length > 0
      },

      // SERP integration analysis
      serpIntegration: {
        suggestions: serpIntegrationSuggestions,
        totalSerpItems: state.serpSelections?.length || 0,
        selectedItems: state.serpSelections?.filter(item => item.selected)?.length || 0,
        integrationScore: serpIntegrationSuggestions.length === 0 ? 100 : 50
      },

      // SEO optimization
      seoOptimization: {
        score: state.seoScore || 0,
        improvements: state.seoImprovements || [],
        optimizationSkipped: state.optimizationSkipped || false,
        mainKeyword: state.mainKeyword,
        secondaryKeywords: state.selectedKeywords || []
      },

      // Content builder state
      contentBuilderState: {
        contentType: state.contentType,
        contentFormat: state.contentFormat,
        contentIntent: state.contentIntent,
        location: state.location,
        additionalInstructions: state.additionalInstructions,
        activeStep: state.activeStep,
        totalSteps: state.steps?.length || 0
      },

      // Quality metrics
      qualityMetrics: {
        hasTitle: !!state.contentTitle,
        hasMetaTitle: !!state.metaTitle,
        hasMetaDescription: !!state.metaDescription,
        hasOutline: (state.outline?.length || 0) > 0,
        hasKeywords: (state.selectedKeywords?.length || 0) > 0,
        hasSelectedSolution: !!state.selectedSolution,
        completionPercentage: 0 // Will be calculated based on above
      }
    };

    // Calculate completion percentage
    const qualityChecks = [
      optimizationData.qualityMetrics.hasTitle,
      optimizationData.qualityMetrics.hasMetaTitle,
      optimizationData.qualityMetrics.hasMetaDescription,
      optimizationData.qualityMetrics.hasOutline,
      optimizationData.qualityMetrics.hasKeywords,
      content.length > 100
    ];
    optimizationData.qualityMetrics.completionPercentage = 
      Math.round((qualityChecks.filter(Boolean).length / qualityChecks.length) * 100);

    // Enhanced solution analysis if solution is selected
    if (state.selectedSolution) {
      try {
        const solutionMetrics = analyzeEnhancedSolutionIntegration(content, state.selectedSolution);
        optimizationData.solutionIntegrationMetrics = solutionMetrics;
        optimizationData.solutionAnalysis = {
          suggestions: solutionSuggestions,
          integrationScore: solutionMetrics.overallScore,
          featureIncorporation: solutionMetrics.featureIncorporation,
          positioningScore: solutionMetrics.positioningScore,
          nameMentions: solutionMetrics.nameMentions,
          mentionedFeatures: solutionMetrics.mentionedFeatures,
          useCasesCovered: solutionMetrics.useCasesCovered,
          differentiatorsMentioned: solutionMetrics.differentiatorsMentioned
        };
      } catch (error) {
        console.error('Error analyzing solution integration:', error);
      }
    }

    return optimizationData;
  }, [
    state,
    contentSuggestions,
    solutionSuggestions,
    analyzedSolutionIntegration,
    aiDetectionSuggestions,
    serpIntegrationSuggestions
  ]);

  /**
   * Run all optimization analyses and capture results
   */
  const runComprehensiveAnalysis = useCallback(async (content: string) => {
    try {
      // Run all analyses in parallel
      const [
        contentAnalysisResults,
        solutionAnalysisResults,
        aiDetectionResults,
        serpAnalysisResults
      ] = await Promise.all([
        analyzeContentQuality(content),
        state.selectedSolution ? analyzeSolution(content) : Promise.resolve([]),
        analyzeAIContent(content),
        analyzeSerpUsage(content)
      ]);

      // Capture comprehensive metadata
      const optimizationMetadata = await captureOptimizationMetadata(content);

      return {
        ...optimizationMetadata,
        analysisResults: {
          contentAnalysis: contentAnalysisResults,
          solutionAnalysis: solutionAnalysisResults,
          aiDetection: aiDetectionResults,
          serpAnalysis: serpAnalysisResults
        }
      };
    } catch (error) {
      console.error('Error running comprehensive analysis:', error);
      return null;
    }
  }, [analyzeContentQuality, analyzeSolution, analyzeAIContent, analyzeSerpUsage, captureOptimizationMetadata, state.selectedSolution]);

  return {
    captureOptimizationMetadata,
    runComprehensiveAnalysis
  };
};