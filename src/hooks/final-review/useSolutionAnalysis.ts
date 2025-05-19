
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SolutionIntegrationMetrics } from '@/contexts/content-builder/types';
import { toast } from 'sonner';

interface CTAInfo {
  count: number;
  texts: string[];
  hasCTA: boolean;
}

export const useSolutionAnalysis = (ctaInfo: CTAInfo) => {
  const { state, setSolutionIntegrationMetrics } = useContentBuilder();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { content, selectedSolution } = state;
  
  const analyzeSolutionUsage = async () => {
    if (!selectedSolution) {
      toast.warning('No solution selected. Please select a solution first.');
      return;
    }
    
    if (!content) {
      toast.warning('No content to analyze. Please generate content first.');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // In a real app, this would be an AI-powered analysis
      // For now, we'll do some basic checks
      
      // Check for feature mentions
      const mentionedFeatures = selectedSolution.features.filter(feature => 
        content.toLowerCase().includes(feature.toLowerCase())
      );
      
      // Check for pain point addressing
      const addressedPainPoints = selectedSolution.painPoints.filter(painPoint => 
        content.toLowerCase().includes(painPoint.toLowerCase())
      );
      
      // Calculate feature incorporation score
      const featureIncorporation = mentionedFeatures.length / selectedSolution.features.length * 100;
      
      // Calculate positioning score based on pain points addressed
      const positioningScore = addressedPainPoints.length / selectedSolution.painPoints.length * 100;
      
      // Calculate value proposition clarity (simplified)
      const valuePropositionClarity = Math.min(
        100, 
        (featureIncorporation + positioningScore) / 2 + (ctaInfo.hasCTA ? 20 : 0)
      );
      
      // Calculate overall integration score
      const overallScore = Math.round((featureIncorporation + positioningScore + valuePropositionClarity) / 3);
      
      // Determine integration level
      let integrationLevel: 'poor' | 'basic' | 'good' | 'excellent';
      if (overallScore < 25) integrationLevel = 'poor';
      else if (overallScore < 50) integrationLevel = 'basic';
      else if (overallScore < 75) integrationLevel = 'good';
      else integrationLevel = 'excellent';
      
      // Create the metrics object
      const metrics: SolutionIntegrationMetrics = {
        featureIncorporation: Math.round(featureIncorporation),
        positioningScore: Math.round(positioningScore),
        valuePropositionClarity: Math.round(valuePropositionClarity),
        integrationLevel,
        overallScore,
        mentionedFeatures,
        painPointsAddressed: addressedPainPoints,
        ctaEffectiveness: ctaInfo.hasCTA ? 100 : 0
      };
      
      // Set the metrics in state
      setSolutionIntegrationMetrics(metrics);
      
      toast.success('Solution integration analysis complete');
    } catch (error) {
      console.error('Error analyzing solution usage:', error);
      toast.error('Failed to analyze solution integration');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  useEffect(() => {
    // Automatically analyze when content changes and a solution is selected
    if (selectedSolution && content && content.length > 100) {
      analyzeSolutionUsage();
    }
  }, []);
  
  return {
    isAnalyzing,
    analyzeSolutionUsage
  };
};
