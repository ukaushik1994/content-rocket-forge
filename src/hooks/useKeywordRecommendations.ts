import { useState, useEffect, useCallback } from 'react';
import { keywordStrategyBridge } from '@/services/keywordStrategyBridge';
import { UnifiedKeyword } from '@/services/keywordLibraryService';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';

interface KeywordOpportunity {
  keyword: UnifiedKeyword;
  opportunityScore: number;
  competitionGap: number;
  volumeToEffortRatio: number;
  reasoning: string;
  recommendedContentType: string;
}

interface UseKeywordRecommendationsResult {
  recommendations: KeywordOpportunity[];
  loading: boolean;
  error: string | null;
  refreshRecommendations: () => Promise<void>;
  getRecommendationsForStrategy: (strategyId: string) => Promise<void>;
}

export const useKeywordRecommendations = (): UseKeywordRecommendationsResult => {
  const { currentStrategy } = useContentStrategy();
  const [recommendations, setRecommendations] = useState<KeywordOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendationsForStrategy = useCallback(async (strategyId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const recs = await keywordStrategyBridge.getKeywordRecommendations(strategyId, 15);
      setRecommendations(recs);
    } catch (err) {
      console.error('Error fetching keyword recommendations:', err);
      setError('Failed to fetch keyword recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRecommendations = useCallback(async () => {
    if (currentStrategy?.id) {
      await getRecommendationsForStrategy(currentStrategy.id);
    }
  }, [currentStrategy?.id, getRecommendationsForStrategy]);

  // Auto-load recommendations when current strategy changes
  useEffect(() => {
    if (currentStrategy?.id) {
      getRecommendationsForStrategy(currentStrategy.id);
    }
  }, [currentStrategy?.id, getRecommendationsForStrategy]);

  return {
    recommendations,
    loading,
    error,
    refreshRecommendations,
    getRecommendationsForStrategy
  };
};

// Hook for content gap analysis
interface ContentGapAnalysis {
  totalKeywords: number;
  coveredKeywords: number;
  gapKeywords: UnifiedKeyword[];
  opportunityScore: number;
  recommendations: string[];
}

interface UseContentGapAnalysisResult {
  analysis: ContentGapAnalysis | null;
  loading: boolean;
  error: string | null;
  analyzeGaps: (strategyId?: string) => Promise<void>;
}

export const useContentGapAnalysis = (): UseContentGapAnalysisResult => {
  const { currentStrategy } = useContentStrategy();
  const [analysis, setAnalysis] = useState<ContentGapAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeGaps = useCallback(async (strategyId?: string) => {
    const targetStrategyId = strategyId || currentStrategy?.id;
    if (!targetStrategyId) return;

    setLoading(true);
    setError(null);
    
    try {
      const gapAnalysis = await keywordStrategyBridge.analyzeContentGaps(targetStrategyId);
      setAnalysis(gapAnalysis);
    } catch (err) {
      console.error('Error analyzing content gaps:', err);
      setError('Failed to analyze content gaps');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, [currentStrategy?.id]);

  // Auto-analyze when current strategy changes
  useEffect(() => {
    if (currentStrategy?.id) {
      analyzeGaps();
    }
  }, [currentStrategy?.id, analyzeGaps]);

  return {
    analysis,
    loading,
    error,
    analyzeGaps
  };
};

// Hook for seasonal content suggestions
interface SeasonalSuggestion {
  id: string;
  title: string;
  suggested_date: string;
  content_type: string;
  priority: string;
  reasoning: string;
  keyword_focus: string;
}

interface UseSeasonalSuggestionsResult {
  suggestions: SeasonalSuggestion[];
  loading: boolean;
  error: string | null;
  loadSuggestions: (strategyId?: string) => Promise<void>;
}

export const useSeasonalSuggestions = (): UseSeasonalSuggestionsResult => {
  const { currentStrategy } = useContentStrategy();
  const [suggestions, setSuggestions] = useState<SeasonalSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = useCallback(async (strategyId?: string) => {
    const targetStrategyId = strategyId || currentStrategy?.id;
    if (!targetStrategyId) return;

    setLoading(true);
    setError(null);
    
    try {
      const seasonalSuggestions = await keywordStrategyBridge.generateSeasonalCalendarSuggestions(targetStrategyId);
      setSuggestions(seasonalSuggestions);
    } catch (err) {
      console.error('Error loading seasonal suggestions:', err);
      setError('Failed to load seasonal suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [currentStrategy?.id]);

  // Auto-load suggestions when current strategy changes
  useEffect(() => {
    if (currentStrategy?.id) {
      loadSuggestions();
    }
  }, [currentStrategy?.id, loadSuggestions]);

  return {
    suggestions,
    loading,
    error,
    loadSuggestions
  };
};