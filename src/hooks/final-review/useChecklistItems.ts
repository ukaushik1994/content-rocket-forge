
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useFinalReview } from '@/hooks/useFinalReview';

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
    selectedKeywords,
    serpSelections,
    content
  } = state;

  const { keywordUsage, ctaInfo } = useFinalReview();

  // Check if SERP selected items are incorporated in the content
  const serpItemsIncorporated = () => {
    if (!content || !serpSelections || serpSelections.length === 0) return false;
    
    const contentLower = content.toLowerCase();
    const selectedSerpItems = serpSelections.filter(item => item.selected);
    
    // If there are no selected items, return false
    if (selectedSerpItems.length === 0) return false;
    
    // Count how many selected items are incorporated in the content
    const incorporatedCount = selectedSerpItems.reduce((count, item) => {
      if (typeof item.content === 'string') {
        // For string content, check if key terms are included
        const terms = item.content.toLowerCase()
          .split(' ')
          .filter(word => word.length > 4) // Only check meaningful words
          .slice(0, 3); // Take first few words
          
        if (terms.some(term => contentLower.includes(term))) {
          return count + 1;
        }
      }
      return count;
    }, 0);
    
    // Return true if at least 50% of selected items are incorporated
    return incorporatedCount >= Math.ceil(selectedSerpItems.length * 0.5);
  };

  // Build checklist items
  const checklistItems = [
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
      passed: ctaInfo.hasCTA && ctaInfo.ctaText.length > 0
    },
    {
      title: 'Solution features are incorporated',
      passed: !!solutionIntegrationMetrics && 
              solutionIntegrationMetrics.featureIncorporation > 50 && 
              solutionIntegrationMetrics.mentionedFeatures.length > 0
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
      passed: selectedKeywords && selectedKeywords.length > 0 && selectedKeywords.filter(k => k !== mainKeyword).some(k => 
        keywordUsage.some(usage => usage.keyword === k && usage.count > 0)
      )
    },
    {
      title: 'SERP selected items are incorporated',
      passed: serpItemsIncorporated()
    }
  ];

  const passedChecks = checklistItems.filter(check => check.passed).length;
  const totalChecks = checklistItems.length;
  const completionPercentage = Math.round((passedChecks / totalChecks) * 100);

  return {
    checklistItems,
    passedChecks,
    totalChecks,
    completionPercentage
  };
};
