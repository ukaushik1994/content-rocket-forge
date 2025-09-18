
import { useState, useCallback, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { OptimizationSuggestion } from './types';
import { 
  useContentAnalysis, 
  useAIDetection, 
  useSerpIntegration, 
  useSolutionAnalysis,
  useContentOptimization
} from './hooks';
import { useContentQualityIntegration } from './hooks/useContentQualityIntegration';
import { toast } from 'sonner';
import { AnalysisDebugger } from './utils/analysisDebugger';

export const useContentOptimizer = (content: string) => {
  const { state } = useContentBuilder();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [hasAIProviders, setHasAIProviders] = useState<boolean>(true);
  const [analysisDebugger] = useState(() => new AnalysisDebugger());

  // Use the real hooks for analysis
  const { contentSuggestions, analyzeContentQuality, isAnalyzing: isContentAnalyzing } = useContentAnalysis();
  const { aiDetectionSuggestions, analyzeAIContent } = useAIDetection();
  // Remove SERP analysis from AI system to eliminate dependencies
  const serpIntegrationSuggestions: any[] = []; // Disabled SERP integration
  const { solutionSuggestions, analyzeSolution } = useSolutionAnalysis();
  const { qualitySuggestions } = useContentQualityIntegration();
  const { optimizeContent: performOptimization } = useContentOptimization();

  // Check AI provider availability on mount and refresh
  useEffect(() => {
    const checkAIProviders = async () => {
      try {
        console.log('🔄 Refreshing AI providers in useContentOptimizer...');
        
        // Clear AIServiceController cache and get fresh data
        const { default: AIServiceController } = await import('@/services/aiService/AIServiceController');
        AIServiceController.clearCache();
        
        // Get fresh provider list using unified service
        const providers = await AIServiceController.getActiveProviders();
        setHasAIProviders(providers.length > 0);
        
        console.log(`🔍 AI providers refreshed: ${providers.length} providers found`);
        console.log('📋 Available providers:', providers.map(p => p.provider));
      } catch (error) {
        console.error('❌ Error checking AI providers:', error);
        setHasAIProviders(false);
      }
    };
    
    checkAIProviders();
  }, []);

  const analyzeContent = useCallback(async () => {
    // Validate content length and quality
    if (!content || content.trim().length < 50) {
      const error = `Content is too short for analysis. Please provide at least 50 characters. Current length: ${content?.length || 0}`;
      console.log('❌ Content validation failed:', error);
      setAnalysisError(error);
      toast.error('Content is too short for analysis');
      return { totalSuggestions: 0, completedAnalyses: 0 };
    }

    if (!hasAIProviders) {
      const error = 'No AI providers configured. Please add API keys in Settings.';
      console.log('❌ AI providers check failed:', error);
      setAnalysisError(error);
      toast.error('No AI providers configured. Please add API keys in Settings.');
      return { totalSuggestions: 0, completedAnalyses: 0 };
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    analysisDebugger.reset();
    
    try {
      console.log('🚀 Starting unified AI analysis...');
      toast.info('Starting AI analysis...');
      
      // Run only core analyses (remove SERP to eliminate dependencies)
      const analysisPromises = [];
      
      // Phase 1: Content Quality Analysis
      analysisPromises.push(
        analyzeContentQuality(content)
          .then(result => ({ type: 'content', result, success: true }))
          .catch(error => ({ type: 'content', error: error.message, success: false }))
      );
      
      // Phase 2: AI Detection Analysis  
      analysisPromises.push(
        analyzeAIContent(content)
          .then(result => ({ type: 'ai', result, success: true }))
          .catch(error => ({ type: 'ai', error: error.message, success: false }))
      );
      
      // Phase 3: Solution Analysis
      analysisPromises.push(
        analyzeSolution(content)
          .then(result => ({ type: 'solution', result, success: true }))
          .catch(error => ({ type: 'solution', error: error.message, success: false }))
      );
      
      // Wait for all analyses to complete
      const results = await Promise.all(analysisPromises);
      
      // Process results
      let completedAnalyses = 0;
      let totalSuggestions = 0;
      const errors: string[] = [];
      
      for (const result of results) {
        if (result.success) {
          completedAnalyses++;
          const suggestionCount = Array.isArray(result.result) ? result.result.length : 0;
          totalSuggestions += suggestionCount;
          console.log(`✅ ${result.type} analysis: ${suggestionCount} suggestions`);
        } else {
          errors.push(`${result.type}: ${result.error}`);
          console.warn(`⚠️ ${result.type} analysis failed: ${result.error}`);
        }
      }
      
      // Add quality suggestions from state
      totalSuggestions += qualitySuggestions.length;
      
      console.log('📊 Analysis Summary:', {
        completedAnalyses,
        totalAnalyses: analysisPromises.length,
        totalSuggestions,
        errors: errors.length
      });

      // Return success if ANY analysis completed successfully
      if (completedAnalyses > 0) {
        if (errors.length > 0) {
          console.log(`⚠️ Partial success: ${completedAnalyses}/${analysisPromises.length} analyses completed`);
        } else {
          console.log(`✅ Full success: ${completedAnalyses}/${analysisPromises.length} analyses completed`);
        }
        return { totalSuggestions, completedAnalyses };
      } else {
        const errorMsg = 'All analyses failed. Please check your AI provider configuration.';
        console.error('❌ All analyses failed:', errors);
        setAnalysisError(errorMsg);
        return { totalSuggestions: 0, completedAnalyses: 0 };
      }

    } catch (error) {
      console.error('❌ Critical error in content analysis:', error);
      const errorMsg = 'Analysis failed. Please try again.';
      setAnalysisError(errorMsg);
      return { totalSuggestions: 0, completedAnalyses: 0 };
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, hasAIProviders, analyzeContentQuality, analyzeAIContent, analyzeSolution, qualitySuggestions.length]);

  const optimizeContent = useCallback(async (): Promise<string | null> => {
    if (selectedSuggestions.length === 0) {
      toast.error('Please select at least one suggestion to optimize.');
      return null;
    }
    
    setIsOptimizing(true);
    
    try {
      // Convert quality suggestions to optimization suggestions
      const qualityAsOptimization: OptimizationSuggestion[] = qualitySuggestions.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        type: 'content' as const,
        priority: typeof q.priority === 'number' ? 
          (q.priority >= 8 ? 'high' : q.priority >= 5 ? 'medium' : 'low') as 'high' | 'medium' | 'low' :
          q.priority as 'high' | 'medium' | 'low',
        category: q.category,
        autoFixable: q.autoFixable,
        impact: q.type === 'critical' ? 'high' as const : q.type === 'major' ? 'medium' as const : 'low' as const,
        effort: 'medium' as const
      }));

      // Get selected suggestions from all categories
      const allSuggestions: OptimizationSuggestion[] = [
        ...contentSuggestions,
        ...aiDetectionSuggestions,
        ...serpIntegrationSuggestions,
        ...solutionSuggestions,
        ...qualityAsOptimization
      ];

      const selected = allSuggestions.filter(s => selectedSuggestions.includes(s.id));
      
      if (selected.length === 0) {
        toast.error('Selected suggestions not found.');
        return null;
      }

      const optimizedContent = await performOptimization(
        content,
        selectedSuggestions,
        selected.filter(s => s.type === 'content' || s.category === 'content' || s.category === 'structure' || s.category === 'seo'),
        selected.filter(s => s.type === 'humanization'),
        [], // SERP integration disabled - empty array
        selected.filter(s => s.type === 'solution' || s.category === 'solution')
      );
      
      if (optimizedContent) {
        toast.success(`Content optimized using ${selected.length} suggestions!`);
        return optimizedContent;
      } else {
        toast.error('Optimization failed. Please try again.');
        return null;
      }
      
    } catch (error) {
      console.error('Error optimizing content:', error);
      toast.error('Optimization failed. Please check your connection and try again.');
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [content, selectedSuggestions, contentSuggestions, aiDetectionSuggestions, serpIntegrationSuggestions, solutionSuggestions, qualitySuggestions, performOptimization]);

  const toggleSuggestion = useCallback((suggestionId: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  }, []);

  const incorporateAllSerpItemsLocal = useCallback(() => {
    // SERP integration disabled - return empty array
    console.log('ℹ️ SERP integration disabled in AI optimization');
    toast.info('SERP integration is handled separately in compliance analysis.');
    return [];
  }, []);

  // Get total suggestion count for UI
  const getTotalSuggestionCount = useCallback(() => {
    return contentSuggestions.length + 
           aiDetectionSuggestions.length + 
           // serpIntegrationSuggestions.length + // SERP integration disabled
           solutionSuggestions.length +
           qualitySuggestions.length;
  }, [contentSuggestions.length, aiDetectionSuggestions.length, solutionSuggestions.length, qualitySuggestions.length]);

  return {
    isAnalyzing: isAnalyzing || isContentAnalyzing,
    isOptimizing,
    contentSuggestions,
    solutionSuggestions,
    aiDetectionSuggestions,
    serpIntegrationSuggestions,
    qualitySuggestions,
    selectedSuggestions,
    analysisError,
    analyzeContent,
    optimizeContent,
    toggleSuggestion,
    incorporateAllSerpItems: incorporateAllSerpItemsLocal,
    getTotalSuggestionCount,
    hasAIProviders
  };
};
