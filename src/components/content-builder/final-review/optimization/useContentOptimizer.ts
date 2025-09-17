
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

export const useContentOptimizer = (content: string) => {
  const { state } = useContentBuilder();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [hasAIProviders, setHasAIProviders] = useState<boolean>(true);

  // Use the real hooks for analysis
  const { contentSuggestions, analyzeContentQuality, isAnalyzing: isContentAnalyzing } = useContentAnalysis();
  const { aiDetectionSuggestions, analyzeAIContent } = useAIDetection();
  const { serpIntegrationSuggestions, analyzeSerpUsage, incorporateAllSerpItems } = useSerpIntegration();
  const { solutionSuggestions, analyzeSolution } = useSolutionAnalysis();
  const { qualitySuggestions } = useContentQualityIntegration();
  const { optimizeContent: performOptimization } = useContentOptimization();

  // Check AI provider availability on mount
  useEffect(() => {
    const checkAIProviders = async () => {
      try {
        const { default: AIServiceController } = await import('@/services/aiService/AIServiceController');
        const providers = await AIServiceController.getActiveProviders();
        setHasAIProviders(providers.length > 0);
        console.log(`🔍 AI providers check: ${providers.length} providers available`);
      } catch (error) {
        console.error('❌ Error checking AI providers:', error);
        setHasAIProviders(false);
      }
    };
    
    checkAIProviders();
  }, []);

  const analyzeContent = useCallback(async () => {
    if (!content || content.length < 50) {
      setAnalysisError('Content is too short for analysis. Please provide at least 50 characters.');
      toast.error('Content is too short for analysis');
      return;
    }

    if (!hasAIProviders) {
      setAnalysisError('No AI providers configured. Please add API keys in Settings.');
      toast.error('No AI providers configured. Please add API keys in Settings.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      console.log('🔄 Starting sequential content analysis to avoid rate limits...');
      
      // Run analyses sequentially with delays to avoid rate limits
      let completedAnalyses = 0;
      const totalAnalyses = 4;
      
      // Phase 1: Content Quality Analysis
      try {
        console.log('📝 Phase 1: Content Quality Analysis');
        await analyzeContentQuality(content);
        completedAnalyses++;
        // Small delay between analyses
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error('❌ Content quality analysis failed:', err);
      }
      
      // Phase 2: AI Detection Analysis  
      try {
        console.log('🤖 Phase 2: AI Detection Analysis');
        await analyzeAIContent(content);
        completedAnalyses++;
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error('❌ AI detection analysis failed:', err);
      }
      
      // Phase 3: SERP Integration Analysis
      try {
        console.log('🔍 Phase 3: SERP Integration Analysis');
        await analyzeSerpUsage(content);
        completedAnalyses++;
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error('❌ SERP integration analysis failed:', err);
      }
      
      // Phase 4: Solution Analysis
      try {
        console.log('🎯 Phase 4: Solution Analysis');
        await analyzeSolution(content);
        completedAnalyses++;
      } catch (err) {
        console.error('❌ Solution analysis failed:', err);
      }
      
      // Check results and provide feedback
      const totalSuggestions = 
        contentSuggestions.length + 
        aiDetectionSuggestions.length + 
        serpIntegrationSuggestions.length + 
        solutionSuggestions.length +
        qualitySuggestions.length;

      if (completedAnalyses === 0) {
        setAnalysisError('All analyses failed. Please check your AI provider configuration.');
        toast.error('Analysis failed. Please check your AI provider settings and try again.');
      } else if (completedAnalyses < totalAnalyses) {
        toast.warning(`Analysis partially completed (${completedAnalyses}/${totalAnalyses} successful). Found ${totalSuggestions} suggestions.`);
      } else if (totalSuggestions === 0) {
        toast.info('Content analysis complete. No optimization suggestions found - your content looks great!');
      } else {
        toast.success(`Analysis complete! Found ${totalSuggestions} optimization opportunities.`);
      }

    } catch (error) {
      console.error('❌ Critical error in content analysis:', error);
      setAnalysisError('Failed to analyze content. Please try again.');
      toast.error('Analysis failed. Please check your connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, hasAIProviders, analyzeContentQuality, analyzeAIContent, analyzeSerpUsage, analyzeSolution, contentSuggestions.length, aiDetectionSuggestions.length, serpIntegrationSuggestions.length, solutionSuggestions.length, qualitySuggestions.length]);

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
        selected.filter(s => s.type === 'serp_integration'),
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
    const serpSuggestionIds = serpIntegrationSuggestions.map(s => s.id);
    setSelectedSuggestions(prev => [...new Set([...prev, ...serpSuggestionIds])]);
    // Also trigger the hook's incorporate function
    incorporateAllSerpItems();
    toast.info(`Selected ${serpSuggestionIds.length} SERP integration suggestions.`);
  }, [serpIntegrationSuggestions, incorporateAllSerpItems]);

  // Get total suggestion count for UI
  const getTotalSuggestionCount = useCallback(() => {
    return contentSuggestions.length + 
           aiDetectionSuggestions.length + 
           serpIntegrationSuggestions.length + 
           solutionSuggestions.length +
           qualitySuggestions.length;
  }, [contentSuggestions.length, aiDetectionSuggestions.length, serpIntegrationSuggestions.length, solutionSuggestions.length, qualitySuggestions.length]);

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
