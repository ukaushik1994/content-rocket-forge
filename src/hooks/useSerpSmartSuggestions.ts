import { useState, useEffect, useCallback } from 'react';
import { SerpQueryResult } from '@/services/serpQueryIntelligence';

export interface SerpSmartSuggestion {
  id: string;
  type: 'keyword' | 'content' | 'optimization' | 'strategy' | 'competitive';
  title: string;
  description: string;
  action: string;
  data?: any;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
}

interface UseSerpSmartSuggestionsProps {
  serpData?: SerpQueryResult[];
  userContext?: any;
  conversationHistory?: any[];
}

interface UseSerpSmartSuggestionsReturn {
  suggestions: SerpSmartSuggestion[];
  isLoading: boolean;
  refreshSuggestions: () => void;
  dismissSuggestion: (id: string) => void;
  applySuggestion: (suggestion: SerpSmartSuggestion) => void;
}

export function useSerpSmartSuggestions({
  serpData = [],
  userContext,
  conversationHistory = []
}: UseSerpSmartSuggestionsProps): UseSerpSmartSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<SerpSmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Generate suggestions based on SERP data and context
  const generateSuggestions = useCallback((): SerpSmartSuggestion[] => {
    const newSuggestions: SerpSmartSuggestion[] = [];

    // SERP-based suggestions
    if (serpData && serpData.length > 0) {
      serpData.forEach((result, index) => {
        const data = result.data;
        const keyword = result.keyword;

        // High volume, low difficulty opportunity
        if (data.searchVolume && data.searchVolume > 5000 && 
            data.keywordDifficulty && data.keywordDifficulty < 40) {
          newSuggestions.push({
            id: `opportunity-${keyword}-${index}`,
            type: 'keyword',
            title: `High-Value Keyword Opportunity`,
            description: `"${keyword}" has ${data.searchVolume.toLocaleString()} searches with only ${data.keywordDifficulty}% difficulty`,
            action: 'create-content-for-keyword',
            data: { keyword, searchVolume: data.searchVolume, difficulty: data.keywordDifficulty },
            priority: 'high',
            confidence: 0.9
          });
        }

        // Content gap opportunities
        if (data.contentGaps && data.contentGaps.length > 3) {
          const topGaps = data.contentGaps.slice(0, 3);
          newSuggestions.push({
            id: `content-gaps-${keyword}-${index}`,
            type: 'content',
            title: `Multiple Content Opportunities`,
            description: `Found ${data.contentGaps.length} content gaps for "${keyword}": ${topGaps.map(g => g.topic).join(', ')}`,
            action: 'generate-content-strategy',
            data: { keyword, contentGaps: topGaps },
            priority: 'high',
            confidence: 0.85
          });
        }

        // FAQ content opportunities
        if (data.questions && data.questions.length > 5) {
          newSuggestions.push({
            id: `faq-opportunity-${keyword}-${index}`,
            type: 'content',
            title: `FAQ Content Opportunity`,
            description: `${data.questions.length} popular questions about "${keyword}" - perfect for FAQ content`,
            action: 'create-faq-content',
            data: { keyword, questions: data.questions.slice(0, 8) },
            priority: 'medium',
            confidence: 0.8
          });
        }

        // High difficulty warning
        if (data.keywordDifficulty && data.keywordDifficulty > 80) {
          newSuggestions.push({
            id: `high-difficulty-${keyword}-${index}`,
            type: 'strategy',
            title: `Consider Long-tail Alternatives`,
            description: `"${keyword}" is highly competitive (${data.keywordDifficulty}% difficulty). Try long-tail variations.`,
            action: 'suggest-longtail-keywords',
            data: { keyword, difficulty: data.keywordDifficulty },
            priority: 'medium',
            confidence: 0.75
          });
        }

        // Featured snippet opportunities
        if (data.featuredSnippets && data.featuredSnippets.length > 0) {
          newSuggestions.push({
            id: `featured-snippet-${keyword}-${index}`,
            type: 'optimization',
            title: `Featured Snippet Opportunity`,
            description: `"${keyword}" has featured snippets - optimize content for position zero`,
            action: 'optimize-for-featured-snippet',
            data: { keyword, snippets: data.featuredSnippets },
            priority: 'high',
            confidence: 0.88
          });
        }
      });
    }

    // Sort by priority and confidence
    return newSuggestions
      .filter(s => !dismissedIds.has(s.id))
      .sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const aScore = priorityWeight[a.priority] * a.confidence;
        const bScore = priorityWeight[b.priority] * b.confidence;
        return bScore - aScore;
      })
      .slice(0, 6); // Limit to top 6 suggestions
  }, [serpData, userContext, conversationHistory, dismissedIds]);

  // Refresh suggestions when dependencies change
  const refreshSuggestions = useCallback(() => {
    setIsLoading(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const newSuggestions = generateSuggestions();
      setSuggestions(newSuggestions);
      setIsLoading(false);
    }, 300);
  }, [generateSuggestions]);

  // Dismiss a suggestion
  const dismissSuggestion = useCallback((id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
    setSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

  // Apply a suggestion (placeholder for future implementation)
  const applySuggestion = useCallback((suggestion: SerpSmartSuggestion) => {
    console.log('Applying suggestion:', suggestion);
    // This would trigger the actual action based on suggestion.action
    // For now, we'll just dismiss the suggestion after applying
    dismissSuggestion(suggestion.id);
  }, [dismissSuggestion]);

  // Auto-refresh when dependencies change
  useEffect(() => {
    refreshSuggestions();
  }, [refreshSuggestions]);

  return {
    suggestions,
    isLoading,
    refreshSuggestions,
    dismissSuggestion,
    applySuggestion
  };
}