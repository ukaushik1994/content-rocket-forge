
import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { toast } from 'sonner';

export const createAnalyticsActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  
  const runComprehensiveAnalysis = async (): Promise<void> => {
    if (!state.content || state.content.trim().length === 0) {
      toast.error('No content to analyze');
      return;
    }

    try {
      dispatch({ type: 'SET_IS_ANALYZING_CONTENT', payload: true });
      
      // Generate content hash for tracking
      const contentHash = btoa(state.content).slice(0, 16);
      
      // Run readability analysis
      const readabilityMetrics = analyzeReadability(state.content);
      
      // Run technical SEO analysis
      const technicalSeoMetrics = analyzeTechnicalSeo(state.content, state.metaTitle, state.metaDescription);
      
      // Calculate content quality metrics
      const contentQualityMetrics = calculateContentQuality(readabilityMetrics, technicalSeoMetrics);
      
      // Create comprehensive analytics object
      const comprehensiveAnalytics = {
        contentHash,
        readabilityMetrics,
        technicalSeoMetrics,
        contentQualityMetrics,
        analysisTimestamp: new Date().toISOString()
      };
      
      // Update state with analytics
      dispatch({ type: 'SET_COMPREHENSIVE_ANALYTICS', payload: comprehensiveAnalytics });
      dispatch({ type: 'SET_LAST_ANALYSIS_HASH', payload: contentHash });
      
      toast.success('Content analysis completed');
    } catch (error) {
      console.error('Error running comprehensive analysis:', error);
      toast.error('Failed to analyze content');
    } finally {
      dispatch({ type: 'SET_IS_ANALYZING_CONTENT', payload: false });
    }
  };

  const analyzeReadability = (content: string) => {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    
    // Simple readability score calculation
    let grade = 'Good';
    if (avgWordsPerSentence > 20) grade = 'Hard';
    else if (avgWordsPerSentence < 10) grade = 'Easy';
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      grade,
      score: Math.max(0, 100 - (avgWordsPerSentence - 15) * 2)
    };
  };

  const analyzeTechnicalSeo = (content: string, metaTitle?: string | null, metaDescription?: string | null) => {
    const headings = (content.match(/<h[1-6][^>]*>/gi) || []).length;
    const links = (content.match(/<a[^>]*href/gi) || []).length;
    const images = (content.match(/<img[^>]*>/gi) || []).length;
    
    return {
      contentLength: content.length,
      headingCount: headings,
      linkCount: links,
      imageCount: images,
      metaTitleLength: metaTitle?.length || 0,
      metaDescriptionLength: metaDescription?.length || 0,
      hasMetaTitle: !!metaTitle,
      hasMetaDescription: !!metaDescription
    };
  };

  const calculateContentQuality = (readability: any, technical: any, serpMetrics?: any) => {
    const structureScore = Math.min(100, (technical.headingCount * 10) + (technical.linkCount * 5));
    const keywordOptimizationScore = 75; // Placeholder
    const metaOptimizationScore = (technical.hasMetaTitle ? 50 : 0) + (technical.hasMetaDescription ? 50 : 0);
    const overallScore = Math.round((readability.score + structureScore + keywordOptimizationScore + metaOptimizationScore) / 4);
    
    return {
      overallScore,
      structureScore,
      keywordOptimizationScore,
      metaOptimizationScore,
      readabilityScore: readability.score
    };
  };

  return {
    runComprehensiveAnalysis,
    analyzeReadability,
    analyzeTechnicalSeo,
    calculateContentQuality
  };
};
