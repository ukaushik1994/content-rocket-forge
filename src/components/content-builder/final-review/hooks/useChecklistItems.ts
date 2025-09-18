
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useState, useCallback, useEffect } from 'react';
import { useContentAnalysis } from '@/hooks/final-review/useContentAnalysis';
import { useContentCompliance } from '@/hooks/useContentCompliance';

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
  const { complianceResult, runComplianceAnalysis } = useContentCompliance();
  
  // State to store checklist items
  const [checklistItems, setChecklistItems] = useState<Array<{title: string, passed: boolean}>>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
        passed: !!solutionIntegrationMetrics && solutionIntegrationMetrics.featureIncorporation > 50
      },
      {
        title: 'Solution is positioned effectively',
        passed: !!solutionIntegrationMetrics && solutionIntegrationMetrics.positioningScore > 70
      },
      {
        title: 'Primary keyword has optimal density (0.5% - 3%)',
        passed: keywordUsage.some(k => k.keyword === mainKeyword && 
          parseFloat(k.density) >= 0.5 && 
          parseFloat(k.density) <= 3)
      },
      {
        title: 'Secondary keywords are included in content',
        passed: selectedKeywords.filter(k => k !== mainKeyword).some(k => 
          keywordUsage.some(usage => usage.keyword === k && usage.count > 0)
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
    
    setChecklistItems(items);
    return items;
  }, [
    documentStructure, 
    metaTitle, 
    metaDescription, 
    ctaInfo, 
    solutionIntegrationMetrics, 
    mainKeyword, 
    keywordUsage, 
    selectedKeywords,
    complianceResult
  ]);
  
  // Function to trigger a refresh of checklist items
  const refreshChecklist = useCallback(async () => {
    console.log('[useChecklistItems] Refreshing checklist items');
    // Auto-run compliance analysis when refreshing
    if (state.content && mainKeyword) {
      await runComplianceAnalysis();
    }
    setRefreshTrigger(prev => prev + 1); // Increment to trigger a refresh
  }, [runComplianceAnalysis, state.content, mainKeyword]);

  // Auto-run compliance analysis on load
  useEffect(() => {
    if (state.content && mainKeyword && !complianceResult) {
      console.log('[useChecklistItems] Auto-running compliance analysis on load');
      runComplianceAnalysis();
    }
  }, [state.content, mainKeyword, runComplianceAnalysis, complianceResult]);

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
