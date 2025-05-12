import { useState, useCallback } from 'react';
import { KeywordUsage } from '@/contexts/content-builder/types/content-types';
import { SeoAnalysisScores, UseSeoAnalysisReturn } from './types';
import { createSeoImprovements } from '@/utils/seo/improvement/createSeoImprovement';

interface AnalysisOperation {
  content: string;
  mainKeyword: string;
  secondaryKeywords: string[];
}

export const useAnalysisOperation = ({ content, mainKeyword, secondaryKeywords }: AnalysisOperation): UseSeoAnalysisReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordUsage, setKeywordUsage] = useState<KeywordUsage[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [scores, setScores] = useState<SeoAnalysisScores>({
    keywordUsage: 0,
    contentLength: 0,
    readability: 0
  });
  const [improvements, setImprovements] = useState<any[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const calculateKeywordUsage = useCallback(() => {
    if (!content || !mainKeyword) return [];

    const allKeywords = [mainKeyword, ...secondaryKeywords].filter(Boolean);
    const keywordData = allKeywords.map(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex) || [];
      const count = matches.length;
      const density = ((count / content.split(/\s+/).length) * 100).toFixed(2) + '%';

      return {
        keyword: keyword,
        count: count,
        density: density
      };
    });

    setKeywordUsage(keywordData);
    return keywordData;
  }, [content, mainKeyword, secondaryKeywords]);

  const calculateContentLengthScore = useCallback(() => {
    const contentLength = content.split(/\s+/).length;
    let score = 0;

    if (contentLength < 300) score = 20;
    else if (contentLength < 600) score = 50;
    else if (contentLength < 1200) score = 80;
    else score = 100;

    return score;
  }, [content]);

  const calculateReadabilityScore = useCallback(() => {
    // Placeholder for readability calculation
    // Implement Flesch Reading Ease or similar
    return 70;
  }, []);

  const generateRecommendations = useCallback(() => {
    const newRecommendations: string[] = [];

    if (scores.keywordUsage < 60) {
      newRecommendations.push("Improve keyword density in your content.");
    }

    if (scores.contentLength < 60) {
      newRecommendations.push("Increase the length of your content.");
    }

    setRecommendations(newRecommendations);
    return newRecommendations;
  }, [scores]);

  const runSeoAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const keywordData = calculateKeywordUsage();
      const keywordUsageScore = keywordData.reduce((acc, curr) => acc + (curr.count > 0 ? 25 : 0), 0);
      const contentLengthScore = calculateContentLengthScore();
      const readabilityScore = calculateReadabilityScore();

      setScores({
        keywordUsage: keywordUsageScore,
        contentLength: contentLengthScore,
        readability: readabilityScore
      });

      const newRecommendations = generateRecommendations();

      // Use the helper to create properly typed SEO improvements
      const seoImprovements = createSeoImprovements([
        {
          id: '1',
          title: 'Optimize meta title',
          description: 'Your meta title could be more compelling',
          type: 'meta',
          recommendation: 'Optimize meta title',
          impact: 'high',
          applied: false,
          suggestion: 'Make your meta title more specific and include the primary keyword',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Improve keyword density',
          description: 'Increase the usage and density of your primary keyword',
          type: 'keyword',
          recommendation: 'Improve keyword density',
          impact: 'medium',
          applied: false,
          suggestion: 'Incorporate the primary keyword naturally throughout the content',
          priority: 'medium'
        },
        {
          id: '3',
          title: 'Enhance content readability',
          description: 'Improve the readability and clarity of your content',
          type: 'readability',
          recommendation: 'Enhance content readability',
          impact: 'medium',
          applied: false,
          suggestion: 'Use shorter sentences and simpler language to improve readability',
          priority: 'medium'
        }
      ]);

      setImprovements(seoImprovements);
    } catch (error: any) {
      console.error("SEO analysis error", error);
      setAnalysisError(error.message || "An error occurred during SEO analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    calculateKeywordUsage,
    calculateContentLengthScore,
    calculateReadabilityScore,
    generateRecommendations
  ]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const forceSkipAnalysis = () => {
    setIsAnalyzing(false);
  };

  return {
    isAnalyzing,
    keywordUsage,
    recommendations,
    scores,
    improvements,
    analysisError,
    runSeoAnalysis,
    getScoreColor,
    forceSkipAnalysis
  };
};
