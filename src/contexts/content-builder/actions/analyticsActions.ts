
import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { ComprehensiveAnalytics, ReadabilityMetrics, ContentQualityMetrics, TechnicalSeoMetrics, SerpIntegrationMetrics } from '../types/analytics-types';
import { toast } from 'sonner';

export const createAnalyticsActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  
  const generateContentHash = (content: string): string => {
    // Simple hash function for content change detection
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  };

  const analyzeReadability = (content: string): ReadabilityMetrics => {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.trim().length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    
    // Simple readability calculation
    let score = 100;
    if (avgWordsPerSentence > 20) score -= 20;
    if (avgWordsPerSentence > 25) score -= 20;
    
    const complexWords = words.filter(w => w.length > 6).length;
    const complexWordRatio = complexWords / words.length;
    if (complexWordRatio > 0.3) score -= 20;
    
    const readingTime = Math.ceil(words.length / 200); // 200 WPM average
    
    return {
      score: Math.max(0, score),
      grade: score > 80 ? 'Easy' : score > 60 ? 'Moderate' : 'Difficult',
      readingTime,
      sentenceComplexity: avgWordsPerSentence > 20 ? 'complex' : avgWordsPerSentence > 15 ? 'moderate' : 'simple',
      wordComplexity: complexWordRatio > 0.3 ? 'advanced' : complexWordRatio > 0.2 ? 'intermediate' : 'basic'
    };
  };

  const analyzeTechnicalSeo = (content: string, metaTitle?: string | null, metaDescription?: string | null): TechnicalSeoMetrics => {
    const headings = {
      h1Count: (content.match(/^#\s/gm) || []).length,
      h2Count: (content.match(/^##\s/gm) || []).length,
      h3Count: (content.match(/^###\s/gm) || []).length,
      totalHeadings: 0
    };
    headings.totalHeadings = headings.h1Count + headings.h2Count + headings.h3Count;

    const words = content.split(/\s+/).filter(w => w.trim().length > 0);
    const primaryKeywordDensity = state.mainKeyword ? 
      (content.toLowerCase().split(state.mainKeyword.toLowerCase()).length - 1) / words.length * 100 : 0;

    const secondaryDensities = state.selectedKeywords.map(keyword => 
      (content.toLowerCase().split(keyword.toLowerCase()).length - 1) / words.length * 100
    );

    return {
      metaTitleStatus: !metaTitle ? 'missing' : 
        metaTitle.length < 30 ? 'short' : 
        metaTitle.length > 60 ? 'long' : 'good',
      metaDescriptionStatus: !metaDescription ? 'missing' : 
        metaDescription.length < 120 ? 'short' : 
        metaDescription.length > 160 ? 'long' : 'good',
      headingStructure: headings,
      keywordDensity: {
        primary: primaryKeywordDensity,
        secondary: secondaryDensities
      },
      contentLength: words.length,
      imageCount: (content.match(/!\[.*?\]\(.*?\)/g) || []).length,
      linkCount: (content.match(/\[.*?\]\(.*?\)/g) || []).length
    };
  };

  const calculateContentQuality = (
    readability: ReadabilityMetrics,
    technical: TechnicalSeoMetrics,
    serpMetrics?: SerpIntegrationMetrics
  ): ContentQualityMetrics => {
    const structureScore = Math.min(100, (technical.headingStructure.totalHeadings * 20) + 
      (technical.contentLength > 300 ? 40 : technical.contentLength / 300 * 40));
    
    const keywordScore = Math.min(100, 
      (technical.keywordDensity.primary > 0.5 && technical.keywordDensity.primary < 3 ? 50 : 25) +
      (technical.keywordDensity.secondary.filter(d => d > 0.3 && d < 2).length * 10)
    );

    const metaScore = 
      (technical.metaTitleStatus === 'good' ? 50 : technical.metaTitleStatus === 'missing' ? 0 : 25) +
      (technical.metaDescriptionStatus === 'good' ? 50 : technical.metaDescriptionStatus === 'missing' ? 0 : 25);

    const overallScore = Math.round(
      (structureScore * 0.25) + 
      (keywordScore * 0.25) + 
      (readability.score * 0.25) + 
      (metaScore * 0.25)
    );

    return {
      overallScore,
      structureScore,
      keywordOptimizationScore: keywordScore,
      readabilityScore: readability.score,
      metaOptimizationScore: metaScore
    };
  };

  const runComprehensiveAnalysis = async (): Promise<void> => {
    if (!state.content || state.content.trim().length === 0) {
      return;
    }

    dispatch({ type: 'SET_IS_ANALYZING_CONTENT', payload: true });

    try {
      const contentHash = generateContentHash(state.content);
      
      // Skip analysis if content hasn't changed
      if (state.lastAnalysisHash === contentHash && state.comprehensiveAnalytics) {
        dispatch({ type: 'SET_IS_ANALYZING_CONTENT', payload: false });
        return;
      }

      const readabilityMetrics = analyzeReadability(state.content);
      const technicalSeoMetrics = analyzeTechnicalSeo(state.content, state.metaTitle, state.metaDescription);
      
      // Create SERP integration metrics from existing data
      const serpIntegrationMetrics: SerpIntegrationMetrics = {
        competitorsAnalyzed: state.serpData?.topResults?.length || 0,
        contentGapsFound: state.serpSelections.filter(s => s.type === 'contentGap').length,
        questionsIntegrated: state.serpSelections.filter(s => s.type === 'question').length,
        entitiesIncluded: state.serpSelections.filter(s => s.type === 'entity').length,
        avgCompetitorLength: state.serpData?.avgContentLength || 0,
        serpOptimizationScore: state.serpSelections.length > 0 ? 80 : 0
      };

      const contentQualityMetrics = calculateContentQuality(
        readabilityMetrics, 
        technicalSeoMetrics, 
        serpIntegrationMetrics
      );

      const comprehensiveAnalytics: ComprehensiveAnalytics = {
        readabilityMetrics,
        contentQualityMetrics,
        technicalSeoMetrics,
        serpIntegrationMetrics,
        analysisTimestamp: new Date().toISOString(),
        contentHash
      };

      dispatch({ type: 'SET_COMPREHENSIVE_ANALYTICS', payload: comprehensiveAnalytics });
      dispatch({ type: 'SET_LAST_ANALYSIS_HASH', payload: contentHash });
      dispatch({ type: 'SET_SEO_SCORE', payload: contentQualityMetrics.overallScore });

    } catch (error) {
      console.error('Error running comprehensive analysis:', error);
      toast.error('Failed to analyze content');
    } finally {
      dispatch({ type: 'SET_IS_ANALYZING_CONTENT', payload: false });
    }
  };

  return {
    runComprehensiveAnalysis,
    analyzeReadability,
    analyzeTechnicalSeo,
    calculateContentQuality
  };
};
