/**
 * Hook for content compliance analysis
 * Integrates with ContentBuilder state to analyze content against all previous selections
 */

import { useState, useCallback, useMemo } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { analyzeContentCompliance } from '@/services/contentComplianceService';
import { analyzeContentQualityWithAI, AIContentQualityResult } from '@/services/aiContentQualityService';
import { 
  ComplianceAnalysisResult, 
  ComplianceAnalysisOptions,
  ComplianceCategory 
} from '@/types/contentCompliance';

export interface UseContentComplianceReturn {
  // Analysis state
  isAnalyzing: boolean;
  analysisError: string | null;
  complianceResult: ComplianceAnalysisResult | null;
  aiQualityResult: AIContentQualityResult | null;
  
  // Analysis functions
  runComplianceAnalysis: (options?: ComplianceAnalysisOptions) => Promise<void>;
  clearAnalysis: () => void;
  
  // Utility functions
  getOverallCompliance: () => boolean;
  getCriticalViolations: () => number;
  getScoreColor: (score: number) => string;
  getCategoryStatus: (category: ComplianceCategory) => 'compliant' | 'warning' | 'critical';
  
  // Quick checks
  hasKeywordIssues: boolean;
  hasSerpIssues: boolean;
  hasSolutionIssues: boolean;
  hasStructureIssues: boolean;
}

export const useContentCompliance = (): UseContentComplianceReturn => {
  const { state } = useContentBuilder();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [complianceResult, setComplianceResult] = useState<ComplianceAnalysisResult | null>(null);
  const [aiQualityResult, setAiQualityResult] = useState<AIContentQualityResult | null>(null);

  /**
   * Run compliance analysis on current content
   */
  const runComplianceAnalysis = useCallback(async (options: ComplianceAnalysisOptions = {}) => {
    if (!state.content || !state.content.trim()) {
      setAnalysisError('No content available for analysis');
      return;
    }

    if (!state.mainKeyword) {
      setAnalysisError('Main keyword is required for compliance analysis');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Run rule-based compliance analysis
      const complianceResult = analyzeContentCompliance(state.content, state, options);
      setComplianceResult(complianceResult);
      
      // Run AI-powered quality analysis
      try {
        const aiResult = await analyzeContentQualityWithAI(state.content, state);
        setAiQualityResult(aiResult);
        console.log('✅ AI content quality analysis completed:', aiResult.overall.grade);
      } catch (aiError) {
        console.warn('AI quality analysis failed, continuing with rule-based analysis only:', aiError);
        // Don't fail the entire analysis if AI fails
      }
    } catch (error) {
      console.error('Compliance analysis failed:', error);
      setAnalysisError(
        error instanceof Error 
          ? `Analysis failed: ${error.message}` 
          : 'Compliance analysis failed unexpectedly'
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [state.content, state.mainKeyword, state]);

  /**
   * Clear analysis results
   */
  const clearAnalysis = useCallback(() => {
    setComplianceResult(null);
    setAiQualityResult(null);
    setAnalysisError(null);
  }, []);

  /**
   * Get overall compliance status
   */
  const getOverallCompliance = useCallback((): boolean => {
    return complianceResult?.overall.compliant ?? false;
  }, [complianceResult]);

  /**
   * Get number of critical violations
   */
  const getCriticalViolations = useCallback((): number => {
    return complianceResult?.overall.criticalViolations ?? 0;
  }, [complianceResult]);

  /**
   * Get score color for UI display
   */
  const getScoreColor = useCallback((score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  }, []);

  /**
   * Get category compliance status
   */
  const getCategoryStatus = useCallback((category: ComplianceCategory): 'compliant' | 'warning' | 'critical' => {
    if (!complianceResult) return 'compliant';
    
    const categoryResult = complianceResult[category];
    const criticalViolations = categoryResult.violations.filter(v => v.severity === 'critical').length;
    const warningViolations = categoryResult.violations.filter(v => v.severity === 'warning').length;
    
    if (criticalViolations > 0) return 'critical';
    if (warningViolations > 0) return 'warning';
    return 'compliant';
  }, [complianceResult]);

  // Quick issue checks
  const hasKeywordIssues = useMemo(() => {
    return (complianceResult?.keyword.violations.length ?? 0) > 0;
  }, [complianceResult]);

  const hasSerpIssues = useMemo(() => {
    return (complianceResult?.serp.violations.length ?? 0) > 0;
  }, [complianceResult]);

  const hasSolutionIssues = useMemo(() => {
    return (complianceResult?.solution.violations.length ?? 0) > 0;
  }, [complianceResult]);

  const hasStructureIssues = useMemo(() => {
    return (complianceResult?.structure.violations.length ?? 0) > 0;
  }, [complianceResult]);

  return {
    // Analysis state
    isAnalyzing,
    analysisError,
    complianceResult,
    aiQualityResult,
    
    // Analysis functions
    runComplianceAnalysis,
    clearAnalysis,
    
    // Utility functions
    getOverallCompliance,
    getCriticalViolations,
    getScoreColor,
    getCategoryStatus,
    
    // Quick checks
    hasKeywordIssues,
    hasSerpIssues,
    hasSolutionIssues,
    hasStructureIssues
  };
};