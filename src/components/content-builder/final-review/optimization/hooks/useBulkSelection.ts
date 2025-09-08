import { useState, useCallback, useMemo } from 'react';
import { OptimizationSuggestion } from '../types';
import { QualityCheckSuggestion } from './useContentQualityIntegration';

export type SuggestionType = OptimizationSuggestion | QualityCheckSuggestion;
export type SelectionCriteria = 'all' | 'none' | 'high_priority' | 'medium_priority' | 'low_priority' | 'high_impact' | 'auto_fixable' | 'category';

export interface BulkSelectionState {
  selectedSuggestions: string[];
  selectionStats: {
    total: number;
    selected: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    autoFixable: number;
    byCategory: Record<string, number>;
  };
}

export function useBulkSelection(allSuggestions: SuggestionType[]) {
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  const selectionStats = useMemo(() => {
    const stats = {
      total: allSuggestions.length,
      selected: selectedSuggestions.length,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0,
      autoFixable: 0,
      byCategory: {} as Record<string, number>
    };

    allSuggestions.forEach(suggestion => {
      const priority = typeof suggestion.priority === 'number' ? 
        (suggestion.priority >= 7 ? 'high' : suggestion.priority >= 4 ? 'medium' : 'low') :
        suggestion.priority;

      switch (priority) {
        case 'high':
          stats.highPriority++;
          break;
        case 'medium':
          stats.mediumPriority++;
          break;
        case 'low':
          stats.lowPriority++;
          break;
      }

      if (suggestion.autoFixable) {
        stats.autoFixable++;
      }

      // Handle different suggestion types
      let category: string;
      if ('category' in suggestion && suggestion.category) {
        category = suggestion.category;
      } else {
        category = suggestion.type;
      }
      
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });

    return stats;
  }, [allSuggestions, selectedSuggestions.length]);

  const toggleSuggestion = useCallback((suggestionId: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  }, []);

  const selectByCriteria = useCallback((criteria: SelectionCriteria, value?: string) => {
    let newSelection: string[] = [];

    switch (criteria) {
      case 'all':
        newSelection = allSuggestions.map(s => s.id);
        break;
      case 'none':
        newSelection = [];
        break;
      case 'high_priority':
        newSelection = allSuggestions
          .filter(s => {
            const priority = typeof s.priority === 'number' ? 
              (s.priority >= 7 ? 'high' : 'medium') : s.priority;
            return priority === 'high';
          })
          .map(s => s.id);
        break;
      case 'medium_priority':
        newSelection = allSuggestions
          .filter(s => {
            const priority = typeof s.priority === 'number' ? 
              (s.priority >= 7 ? 'high' : s.priority >= 4 ? 'medium' : 'low') : s.priority;
            return priority === 'medium';
          })
          .map(s => s.id);
        break;
      case 'low_priority':
        newSelection = allSuggestions
          .filter(s => {
            const priority = typeof s.priority === 'number' ? 
              (s.priority < 4 ? 'low' : 'medium') : s.priority;
            return priority === 'low';
          })
          .map(s => s.id);
        break;
      case 'high_impact':
        newSelection = allSuggestions
          .filter(s => 'impact' in s && s.impact === 'high')
          .map(s => s.id);
        break;
      case 'auto_fixable':
        newSelection = allSuggestions
          .filter(s => s.autoFixable)
          .map(s => s.id);
        break;
      case 'category':
        if (value) {
          newSelection = allSuggestions
            .filter(s => {
              // Handle different suggestion types
              let category: string;
              if ('category' in s && s.category) {
                category = s.category;
              } else {
                category = s.type;
              }
              return category === value;
            })
            .map(s => s.id);
        }
        break;
    }

    setSelectedSuggestions(newSelection);
  }, [allSuggestions]);

  const getSmartRecommendations = useCallback(() => {
    // Smart algorithm to recommend optimal suggestions based on impact, effort, and priority
    const scored = allSuggestions.map(suggestion => {
      let score = 0;
      
      // Priority scoring
      const priority = typeof suggestion.priority === 'number' ? suggestion.priority : 
        (suggestion.priority === 'high' ? 8 : suggestion.priority === 'medium' ? 5 : 2);
      score += priority * 2;

      // Impact scoring
      if ('impact' in suggestion) {
        const impactScore = suggestion.impact === 'high' ? 6 : suggestion.impact === 'medium' ? 4 : 2;
        score += impactScore;
      }

      // Effort scoring (lower effort = higher score)
      if ('effort' in suggestion) {
        const effortScore = suggestion.effort === 'low' ? 4 : suggestion.effort === 'medium' ? 2 : 1;
        score += effortScore;
      }

      // Auto-fixable bonus
      if (suggestion.autoFixable) {
        score += 3;
      }

      return { suggestion, score };
    });

    // Sort by score and take top suggestions
    scored.sort((a, b) => b.score - a.score);
    const topSuggestions = scored.slice(0, Math.min(10, Math.ceil(scored.length * 0.6)));
    
    return topSuggestions.map(item => item.suggestion.id);
  }, [allSuggestions]);

  const selectSmartRecommendations = useCallback(() => {
    const recommendations = getSmartRecommendations();
    setSelectedSuggestions(recommendations);
  }, [getSmartRecommendations]);

  const isAllSelected = useMemo(() => 
    allSuggestions.length > 0 && selectedSuggestions.length === allSuggestions.length,
    [allSuggestions.length, selectedSuggestions.length]
  );

  const isNoneSelected = useMemo(() => 
    selectedSuggestions.length === 0,
    [selectedSuggestions.length]
  );

  const getEstimatedImpact = useCallback(() => {
    const selectedItems = allSuggestions.filter(s => selectedSuggestions.includes(s.id));
    
    let impactScore = 0;
    let effortScore = 0;
    
    selectedItems.forEach(item => {
      // Calculate impact
      if ('impact' in item) {
        impactScore += item.impact === 'high' ? 3 : item.impact === 'medium' ? 2 : 1;
      }
      
      // Calculate effort
      if ('effort' in item) {
        effortScore += item.effort === 'high' ? 3 : item.effort === 'medium' ? 2 : 1;
      }
    });

    return {
      impact: impactScore,
      effort: effortScore,
      efficiency: selectedItems.length > 0 ? impactScore / Math.max(effortScore, 1) : 0,
      estimatedTime: effortScore * 30 // seconds per effort point
    };
  }, [allSuggestions, selectedSuggestions]);

  return {
    selectedSuggestions,
    selectionStats,
    toggleSuggestion,
    selectByCriteria,
    selectSmartRecommendations,
    getSmartRecommendations,
    isAllSelected,
    isNoneSelected,
    getEstimatedImpact,
    setSelectedSuggestions
  };
}