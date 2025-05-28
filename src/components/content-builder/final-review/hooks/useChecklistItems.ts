
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useState, useCallback, useEffect } from 'react';
import { useContentAnalysis } from '@/hooks/final-review/useContentAnalysis'; 

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
        passed: ctaInfo.hasCallToAction
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
          k.density >= 0.5 && 
          k.density <= 3)
      },
      {
        title: 'Secondary keywords are included in content',
        passed: selectedKeywords.filter(k => k !== mainKeyword).some(k => 
          keywordUsage.some(usage => usage.keyword === k && usage.count > 0)
        )
      }
    ];
    
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
    selectedKeywords
  ]);
  
  // Function to trigger a refresh of checklist items
  const refreshChecklist = useCallback(() => {
    console.log('[useChecklistItems] Refreshing checklist items');
    setRefreshTrigger(prev => prev + 1); // Increment to trigger a refresh
  }, []);

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
