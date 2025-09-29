import { useState, useCallback } from 'react';
import { contentPerformancePredictionService, PerformancePrediction, TopicGap } from '@/services/contentPerformancePredictionService';
import { toast } from 'sonner';

export function useContentPerformancePrediction() {
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PerformancePrediction | null>(null);
  const [topicGaps, setTopicGaps] = useState<TopicGap[]>([]);

  const predictPerformance = useCallback(async (
    content: string,
    title: string,
    keywords: string[],
    contentType: string = 'blog'
  ) => {
    if (!content || !title || keywords.length === 0) {
      toast.error('Content, title, and keywords are required');
      return null;
    }

    setIsPredicting(true);
    try {
      const result = await contentPerformancePredictionService.predictPerformance(
        content,
        title,
        keywords,
        contentType
      );

      // Also get topic gaps and search intent
      const [gaps, searchIntent] = await Promise.all([
        contentPerformancePredictionService.identifyTopicGaps(keywords[0], content),
        contentPerformancePredictionService.analyzeSearchIntent(keywords[0], content),
      ]);

      result.topicGaps = gaps;
      result.searchIntentMatch = searchIntent;

      setPrediction(result);
      setTopicGaps(gaps);

      toast.success('Performance prediction complete');
      return result;
    } catch (error) {
      console.error('Performance prediction failed:', error);
      toast.error('Failed to predict performance');
      return null;
    } finally {
      setIsPredicting(false);
    }
  }, []);

  const analyzeTopicGaps = useCallback(async (mainKeyword: string, content: string) => {
    try {
      const gaps = await contentPerformancePredictionService.identifyTopicGaps(mainKeyword, content);
      setTopicGaps(gaps);
      return gaps;
    } catch (error) {
      console.error('Topic gap analysis failed:', error);
      return [];
    }
  }, []);

  const analyzeSearchIntent = useCallback(async (keyword: string, content: string) => {
    try {
      const intent = await contentPerformancePredictionService.analyzeSearchIntent(keyword, content);
      
      if (prediction) {
        setPrediction({
          ...prediction,
          searchIntentMatch: intent,
        });
      }

      return intent;
    } catch (error) {
      console.error('Search intent analysis failed:', error);
      return null;
    }
  }, [prediction]);

  return {
    isPredicting,
    prediction,
    topicGaps,
    predictPerformance,
    analyzeTopicGaps,
    analyzeSearchIntent,
  };
}
