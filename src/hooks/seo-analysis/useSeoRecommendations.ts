
import { useState, useCallback, useMemo } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { SeoImprovement } from '@/contexts/content-builder/types/seo-types';
import { getSeoRecommendationsAsInstructions, prioritizeRecommendations } from '@/utils/seo/recommendationsToInstructions';

export interface UseSeoRecommendationsReturn {
  recommendations: SeoImprovement[];
  prioritizedRecommendations: SeoImprovement[];
  seoInstructions: string;
  applyAllRecommendations: () => void;
  applySingleRecommendation: (id: string) => void;
  getRecommendationById: (id: string) => SeoImprovement | undefined;
  isRecommendationApplied: (id: string) => boolean;
  unappliedRecommendationsCount: number;
}

/**
 * Hook for managing SEO recommendations and converting them to AI instructions
 */
export const useSeoRecommendations = (): UseSeoRecommendationsReturn => {
  const { state, applySeoImprovement } = useContentBuilder();
  const { seoImprovements = [], keywordUsage = [] } = state;
  
  // Get all recommendations that haven't been applied yet
  const unappliedRecommendations = useMemo(() => 
    seoImprovements.filter(rec => !rec.applied),
  [seoImprovements]);
  
  // Calculate prioritized recommendations
  const prioritizedRecommendations = useMemo(() => 
    prioritizeRecommendations(seoImprovements),
  [seoImprovements]);

  // Convert recommendations to AI-friendly instructions
  const seoInstructions = useMemo(() => 
    getSeoRecommendationsAsInstructions(unappliedRecommendations, keywordUsage),
  [unappliedRecommendations, keywordUsage]);

  // Get a recommendation by its ID
  const getRecommendationById = useCallback((id: string): SeoImprovement | undefined => {
    return seoImprovements.find(rec => rec.id === id);
  }, [seoImprovements]);

  // Check if a recommendation has been applied
  const isRecommendationApplied = useCallback((id: string): boolean => {
    const rec = getRecommendationById(id);
    return rec ? rec.applied : false;
  }, [getRecommendationById]);

  // Apply a single recommendation
  const applySingleRecommendation = useCallback((id: string) => {
    if (!isRecommendationApplied(id)) {
      applySeoImprovement(id);
      return true;
    }
    return false;
  }, [applySeoImprovement, isRecommendationApplied]);

  // Apply all recommendations at once
  const applyAllRecommendations = useCallback(() => {
    let appliedCount = 0;
    
    unappliedRecommendations.forEach(rec => {
      applySeoImprovement(rec.id);
      appliedCount++;
    });
    
    if (appliedCount > 0) {
      toast.success(`Applied ${appliedCount} SEO recommendations`);
    } else {
      toast.info('No recommendations left to apply');
    }
    
    return appliedCount;
  }, [unappliedRecommendations, applySeoImprovement]);

  return {
    recommendations: seoImprovements,
    prioritizedRecommendations,
    seoInstructions,
    applyAllRecommendations,
    applySingleRecommendation,
    getRecommendationById,
    isRecommendationApplied,
    unappliedRecommendationsCount: unappliedRecommendations.length
  };
};
