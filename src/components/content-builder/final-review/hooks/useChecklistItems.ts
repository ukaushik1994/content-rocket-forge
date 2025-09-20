
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useState, useCallback, useEffect } from 'react';
import { useContentAnalysis } from '@/hooks/final-review/useContentAnalysis';
import { useContentCompliance } from '@/hooks/useContentCompliance';
import { generateAIChecklistItems } from '@/services/aiContentQualityService';
import { analyzeEnhancedSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';
import { toast } from 'sonner';

/**
 * Custom hook to generate and manage the checklist items for the final review
 */
export const useChecklistItems = () => {
  const { state } = useContentBuilder();
  const { 
    mainKeyword,
    metaTitle, 
    metaDescription, 
    documentStructure, 
    solutionIntegrationMetrics,
    selectedKeywords
  } = state;

  // Get content analysis data directly instead of via useFinalReview
  const { keywordUsage, ctaInfo } = useContentAnalysis();
  const { complianceResult, aiQualityResult, runComplianceAnalysis } = useContentCompliance();
  
  // State to store checklist items
  const [checklistItems, setChecklistItems] = useState<Array<{title: string, passed: boolean}>>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [localSolutionMetrics, setLocalSolutionMetrics] = useState<any>(null);

  // Function to calculate checklist items
  const calculateChecklistItems = useCallback(() => {
    const items = [
      {
        title: 'Document has exactly one H1 tag',
        passed: !!documentStructure?.hasSingleH1
      },
      {
        title: 'Document has logical heading hierarchy',
        passed: !!documentStructure?.hasLogicalHierarchy
      },
      {
        title: 'Meta title includes primary keyword',
        passed: !!metaTitle && mainKeyword ? metaTitle.toLowerCase().includes(mainKeyword.toLowerCase()) : false
      },
      {
        title: 'Meta description is 50-160 characters',
        passed: !!metaDescription && metaDescription.length >= 50 && metaDescription.length <= 160
      },
      {
        title: 'Content has call-to-action',
        passed: ctaInfo.hasCTA
      },
      {
        title: 'Solution features are incorporated',
        passed: !!(solutionIntegrationMetrics || localSolutionMetrics) && 
          ((solutionIntegrationMetrics?.featureIncorporation || localSolutionMetrics?.featureIncorporation || 0) > 50)
      },
      {
        title: 'Solution is positioned effectively',
        passed: !!(solutionIntegrationMetrics || localSolutionMetrics) && 
          ((solutionIntegrationMetrics?.positioningScore || localSolutionMetrics?.positioningScore || 0) > 70)
      },
      {
        title: 'Primary keyword has optimal density (0.5% - 3%)',
        passed: keywordUsage.some(k => 
          k.keyword?.toLowerCase() === mainKeyword?.toLowerCase() && 
          k.density && 
          parseFloat(k.density.replace('%', '')) >= 0.5 && 
          parseFloat(k.density.replace('%', '')) <= 3
        )
      },
      {
        title: 'Secondary keywords are included in content',
        passed: selectedKeywords.filter(k => k && k !== mainKeyword).some(k => 
          keywordUsage.some(usage => 
            usage.keyword?.toLowerCase() === k?.toLowerCase() && 
            usage.count > 0
          )
        )
      }
    ];

    // Add compliance-based checks if available
    if (complianceResult) {
      // Keyword compliance checks
      if (complianceResult.keyword.violations.length > 0) {
        items.push({
          title: "Keyword density optimized",
          passed: complianceResult.keyword.violations.filter(v => v.severity === 'critical').length === 0
        });
        items.push({
          title: "Keyword placement strategic",
          passed: complianceResult.keyword.violations.filter(v => v.message.includes('placement')).length === 0
        });
      }

      // SERP compliance checks
      if (complianceResult.serp.violations.length > 0) {
        items.push({
          title: "SERP competition addressed",
          passed: complianceResult.serp.violations.filter(v => v.severity === 'critical').length === 0
        });
        items.push({
          title: "Search intent alignment verified",
          passed: complianceResult.serp.violations.filter(v => v.message.includes('intent')).length === 0
        });
      }

      // Solution compliance checks
      if (complianceResult.solution.violations.length > 0) {
        items.push({
          title: "Solution benefits highlighted",
          passed: complianceResult.solution.violations.filter(v => v.severity === 'critical').length === 0
        });
        items.push({
          title: "Product features integrated",
          passed: complianceResult.solution.violations.filter(v => v.message.includes('feature')).length === 0
        });
      }

      // Structure compliance checks
      if (complianceResult.structure.violations.length > 0) {
        items.push({
          title: "Content structure compliant",
          passed: complianceResult.structure.violations.filter(v => v.severity === 'critical').length === 0
        });
        items.push({
          title: "Readability standards met",
          passed: complianceResult.structure.violations.filter(v => v.message.includes('readability')).length === 0
        });
      }
    }

    // Add AI-powered quality checks if available
    if (aiQualityResult) {
      const aiItems = generateAIChecklistItems(aiQualityResult);
      
      // Add separator for AI checks
      items.push({
        title: `AI Quality Analysis (Grade: ${aiQualityResult.overall.grade})`,
        passed: aiQualityResult.overall.score >= 70
      });
      
      // Add AI-generated items with proper formatting
      aiItems.forEach(aiItem => {
        items.push({
          title: aiItem.label,
          passed: aiItem.passed
        });
      });
    }
    
    setChecklistItems(items);
    return items;
  }, [
    documentStructure, 
    metaTitle, 
    metaDescription, 
    ctaInfo, 
    solutionIntegrationMetrics, 
    localSolutionMetrics,
    mainKeyword, 
    keywordUsage, 
    selectedKeywords,
    complianceResult,
    aiQualityResult
  ]);
  
  // Comprehensive analysis function
  const runFullAnalysis = useCallback(async () => {
    console.log('[useChecklistItems] Running comprehensive analysis');
    
    if (!state.content || !mainKeyword) {
      toast.error('Content and main keyword are required for analysis');
      return;
    }

    try {
      toast.info('Running comprehensive content analysis...');
      
      // Run solution integration analysis if solution is selected
      if (state.selectedSolution) {
        toast.info('Analyzing solution integration...');
        const solutionMetrics = analyzeEnhancedSolutionIntegration(
          state.content, 
          state.selectedSolution
        );
        setLocalSolutionMetrics(solutionMetrics);
        console.log('[useChecklistItems] Solution analysis completed:', solutionMetrics);
      }
      
      // Run compliance analysis (includes AI analysis)
      await runComplianceAnalysis();
      
      // Trigger checklist recalculation
      setRefreshTrigger(prev => prev + 1);
      
      // Show success message
      if (aiQualityResult) {
        toast.success(`Analysis complete! AI Grade: ${aiQualityResult.overall.grade}`);
      } else {
        toast.success('Content analysis complete!');
      }
    } catch (error) {
      console.error('[useChecklistItems] Full analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
    }
  }, [runComplianceAnalysis, state.content, state.selectedSolution, mainKeyword, aiQualityResult]);

  // Function to trigger a refresh of checklist items
  const refreshChecklist = useCallback(async () => {
    await runFullAnalysis();
  }, [runFullAnalysis]);

  // Auto-run full analysis on load
  useEffect(() => {
    if (state.content && mainKeyword && !complianceResult && !localSolutionMetrics) {
      console.log('[useChecklistItems] Auto-running full analysis on load');
      runFullAnalysis();
    }
  }, [state.content, mainKeyword, runFullAnalysis, complianceResult, localSolutionMetrics]);

  // Calculate items on mount and when dependencies change
  useEffect(() => {
    calculateChecklistItems();
  }, [calculateChecklistItems, refreshTrigger]);

  const passedChecks = checklistItems.filter(check => check.passed).length;
  const totalChecks = checklistItems.length;
  const completionPercentage = Math.round((passedChecks / totalChecks) * 100);

  return {
    checklistItems,
    passedChecks,
    totalChecks,
    completionPercentage,
    refreshChecklist
  };
};
