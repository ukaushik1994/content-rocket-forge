import { useState, useCallback } from 'react';
import { contentIntelligenceService, ContentAnalysisResult, TitleSuggestion, ReadabilityMetrics } from '@/services/contentIntelligenceService';
import { toast } from 'sonner';

export function useContentIntelligence() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ContentAnalysisResult | null>(null);
  const [readabilityMetrics, setReadabilityMetrics] = useState<ReadabilityMetrics | null>(null);
  const [titleSuggestions, setTitleSuggestions] = useState<TitleSuggestion[]>([]);
  const [metaDescriptions, setMetaDescriptions] = useState<string[]>([]);

  const analyzeContent = useCallback(async (
    content: string,
    title: string,
    keywords: string[],
    contentType: string = 'blog'
  ) => {
    if (!content || !title) {
      toast.error('Content and title are required for analysis');
      return null;
    }

    setIsAnalyzing(true);
    try {
      // Parallel analysis
      const [analysisResult, readability, titles, descriptions] = await Promise.all([
        contentIntelligenceService.analyzeContent(content, title, keywords, contentType),
        Promise.resolve(contentIntelligenceService.calculateReadability(content)),
        contentIntelligenceService.generateTitleSuggestions(content, title, keywords),
        contentIntelligenceService.generateMetaDescriptions(content, title, keywords),
      ]);

      // Add keyword density to analysis
      const keywordDensity = contentIntelligenceService.calculateKeywordDensity(content, keywords);
      analysisResult.keywordDensity = keywordDensity;

      // Add heading analysis
      const headingAnalysis = contentIntelligenceService.analyzeHeadingStructure(content, keywords);
      analysisResult.headingStructure = headingAnalysis;

      setAnalysis(analysisResult);
      setReadabilityMetrics(readability);
      setTitleSuggestions(titles);
      setMetaDescriptions(descriptions);

      toast.success('Content analysis complete');
      return analysisResult;
    } catch (error) {
      console.error('Content intelligence analysis failed:', error);
      toast.error('Failed to analyze content');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const findInternalLinks = useCallback(async (content: string, currentUrl: string) => {
    try {
      const opportunities = await contentIntelligenceService.findInternalLinkingOpportunities(content, currentUrl);
      
      if (analysis) {
        setAnalysis({
          ...analysis,
          internalLinkingOpportunities: opportunities,
        });
      }

      return opportunities;
    } catch (error) {
      console.error('Internal linking analysis failed:', error);
      toast.error('Failed to find internal linking opportunities');
      return [];
    }
  }, [analysis]);

  const refreshTitleSuggestions = useCallback(async (
    content: string,
    currentTitle: string,
    keywords: string[]
  ) => {
    try {
      const suggestions = await contentIntelligenceService.generateTitleSuggestions(content, currentTitle, keywords);
      setTitleSuggestions(suggestions);
      return suggestions;
    } catch (error) {
      console.error('Title suggestion refresh failed:', error);
      return [];
    }
  }, []);

  const refreshMetaDescriptions = useCallback(async (
    content: string,
    title: string,
    keywords: string[]
  ) => {
    try {
      const descriptions = await contentIntelligenceService.generateMetaDescriptions(content, title, keywords);
      setMetaDescriptions(descriptions);
      return descriptions;
    } catch (error) {
      console.error('Meta description refresh failed:', error);
      return [];
    }
  }, []);

  return {
    isAnalyzing,
    analysis,
    readabilityMetrics,
    titleSuggestions,
    metaDescriptions,
    analyzeContent,
    findInternalLinks,
    refreshTitleSuggestions,
    refreshMetaDescriptions,
  };
}
