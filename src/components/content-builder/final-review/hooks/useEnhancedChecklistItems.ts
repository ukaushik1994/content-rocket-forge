
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useState, useCallback, useEffect } from 'react';
import { useContentAnalysis } from '@/hooks/final-review/useContentAnalysis';
import { analyzeSerpUsage } from '@/services/serpIntegrationAnalyzer';
import { analyzeContentHumanization } from '@/services/contentHumanizerService';

export interface ChecklistSection {
  id: string;
  title: string;
  items: Array<{title: string, passed: boolean, description?: string}>;
  passedCount: number;
  totalCount: number;
  percentage: number;
}

export interface EnhancedChecklistData {
  sections: ChecklistSection[];
  overallScore: number;
  totalPassed: number;
  totalChecks: number;
}

/**
 * Enhanced hook for comprehensive checklist including SERP usage and humanization
 */
export const useEnhancedChecklistItems = () => {
  const { state } = useContentBuilder();
  const { 
    content,
    mainKeyword,
    metaTitle, 
    metaDescription, 
    documentStructure, 
    solutionIntegrationMetrics,
    selectedKeywords,
    serpSelections
  } = state;

  const { keywordUsage, ctaInfo } = useContentAnalysis();
  
  const [checklistData, setChecklistData] = useState<EnhancedChecklistData>({
    sections: [],
    overallScore: 0,
    totalPassed: 0,
    totalChecks: 0
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Function to calculate all checklist sections
  const calculateEnhancedChecklist = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      // Technical SEO Section
      const technicalItems = [
        {
          title: 'Document has exactly one H1 tag',
          passed: !!documentStructure?.hasSingleH1,
          description: 'Essential for proper document structure and SEO'
        },
        {
          title: 'Document has logical heading hierarchy',
          passed: !!documentStructure?.hasLogicalHierarchy,
          description: 'Improves readability and search engine understanding'
        },
        {
          title: 'Meta title includes primary keyword',
          passed: !!metaTitle && mainKeyword ? metaTitle.toLowerCase().includes(mainKeyword.toLowerCase()) : false,
          description: 'Critical for search engine visibility'
        },
        {
          title: 'Meta description is 50-160 characters',
          passed: !!metaDescription && metaDescription.length >= 50 && metaDescription.length <= 160,
          description: 'Optimal length for search result snippets'
        }
      ];

      // Content Quality Section
      const contentQualityItems = [
        {
          title: 'Content has call-to-action',
          passed: ctaInfo.hasCTA,
          description: 'Drives user engagement and conversions'
        },
        {
          title: 'Primary keyword has optimal density (0.5% - 3%)',
          passed: keywordUsage.some(k => k.keyword === mainKeyword && 
            parseFloat(k.density) >= 0.5 && 
            parseFloat(k.density) <= 3),
          description: 'Balanced keyword usage for SEO without over-optimization'
        },
        {
          title: 'Secondary keywords are included in content',
          passed: selectedKeywords.filter(k => k !== mainKeyword).some(k => 
            keywordUsage.some(usage => usage.keyword === k && usage.count > 0)
          ),
          description: 'Comprehensive keyword coverage improves topical authority'
        },
        {
          title: 'Content length is adequate (300+ words)',
          passed: content ? content.split(/\s+/).length >= 300 : false,
          description: 'Sufficient content depth for search engines and users'
        }
      ];

      // SERP Integration Section
      const serpUsage = analyzeSerpUsage(content || '', serpSelections || []);
      const serpItems = [
        {
          title: 'SERP items usage rate above 70%',
          passed: serpUsage.usagePercentage >= 70,
          description: `Currently ${serpUsage.usagePercentage}% (${serpUsage.totalUsed}/${serpUsage.totalSelected})`
        },
        {
          title: 'Selected questions are addressed',
          passed: serpUsage.byType.questions.percentage >= 70,
          description: `${serpUsage.byType.questions.used}/${serpUsage.byType.questions.selected} questions addressed`
        },
        {
          title: 'SERP headings are incorporated',
          passed: serpUsage.byType.headings.percentage >= 60,
          description: `${serpUsage.byType.headings.used}/${serpUsage.byType.headings.selected} headings used`
        },
        {
          title: 'SERP entities are mentioned',
          passed: serpUsage.byType.entities.percentage >= 50,
          description: `${serpUsage.byType.entities.used}/${serpUsage.byType.entities.selected} entities included`
        }
      ];

      // Content Humanization Section
      let humanizationItems = [
        {
          title: 'Content analysis pending...',
          passed: false,
          description: 'Analyzing content for AI patterns and humanization'
        }
      ];

      // Analyze content humanization
      if (content && content.length > 100) {
        try {
          const humanizationAnalysis = await analyzeContentHumanization(content);
          if (humanizationAnalysis) {
            humanizationItems = [
              {
                title: 'Content appears human-written',
                passed: !humanizationAnalysis.isAiGenerated || humanizationAnalysis.confidence < 60,
                description: humanizationAnalysis.isAiGenerated ? 
                  `AI detection confidence: ${humanizationAnalysis.confidence}%` :
                  'Content passes AI detection checks'
              },
              {
                title: 'High humanization score',
                passed: humanizationAnalysis.humanizationScore >= 70,
                description: `Humanization score: ${humanizationAnalysis.humanizationScore}/100`
              },
              {
                title: 'No critical humanization issues',
                passed: humanizationAnalysis.issues.filter(issue => issue.severity === 'high').length === 0,
                description: `${humanizationAnalysis.issues.filter(issue => issue.severity === 'high').length} critical issues found`
              },
              {
                title: 'Natural tone and flow',
                passed: humanizationAnalysis.issues.filter(issue => 
                  issue.type === 'robotic_tone' || issue.type === 'unnatural_transitions'
                ).length === 0,
                description: 'Content maintains conversational and natural tone'
              }
            ];
          }
        } catch (error) {
          console.error('Error analyzing humanization:', error);
          humanizationItems = [
            {
              title: 'Humanization analysis failed',
              passed: false,
              description: 'Unable to analyze content for AI patterns'
            }
          ];
        }
      }

      // Solution Integration Section
      const solutionItems = [
        {
          title: 'Solution features are incorporated',
          passed: !!solutionIntegrationMetrics && solutionIntegrationMetrics.featureIncorporation > 50,
          description: solutionIntegrationMetrics ? 
            `${solutionIntegrationMetrics.featureIncorporation}% feature incorporation` :
            'No solution integration analysis available'
        },
        {
          title: 'Solution is positioned effectively',
          passed: !!solutionIntegrationMetrics && solutionIntegrationMetrics.positioningScore > 70,
          description: solutionIntegrationMetrics ?
            `${solutionIntegrationMetrics.positioningScore}% positioning score` :
            'No positioning analysis available'
        }
      ];

      // Calculate section stats
      const calculateSectionStats = (items: typeof technicalItems) => {
        const passedCount = items.filter(item => item.passed).length;
        const totalCount = items.length;
        const percentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
        return { passedCount, totalCount, percentage };
      };

      const technicalStats = calculateSectionStats(technicalItems);
      const contentStats = calculateSectionStats(contentQualityItems);
      const serpStats = calculateSectionStats(serpItems);
      const humanizationStats = calculateSectionStats(humanizationItems);
      const solutionStats = calculateSectionStats(solutionItems);

      const sections: ChecklistSection[] = [
        {
          id: 'technical',
          title: 'Technical SEO',
          items: technicalItems,
          ...technicalStats
        },
        {
          id: 'content-quality',
          title: 'Content Quality',
          items: contentQualityItems,
          ...contentStats
        },
        {
          id: 'serp-integration',
          title: 'SERP Integration',
          items: serpItems,
          ...serpStats
        },
        {
          id: 'humanization',
          title: 'Content Humanization',
          items: humanizationItems,
          ...humanizationStats
        },
        {
          id: 'solution-integration',
          title: 'Solution Integration',
          items: solutionItems,
          ...solutionStats
        }
      ];

      const totalPassed = sections.reduce((sum, section) => sum + section.passedCount, 0);
      const totalChecks = sections.reduce((sum, section) => sum + section.totalCount, 0);
      const overallScore = totalChecks > 0 ? Math.round((totalPassed / totalChecks) * 100) : 0;

      setChecklistData({
        sections,
        overallScore,
        totalPassed,
        totalChecks
      });

    } catch (error) {
      console.error('Error calculating enhanced checklist:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    documentStructure, 
    metaTitle, 
    metaDescription, 
    ctaInfo, 
    solutionIntegrationMetrics, 
    mainKeyword, 
    keywordUsage, 
    selectedKeywords,
    content,
    serpSelections
  ]);
  
  // Function to trigger a refresh of checklist items
  const refreshChecklist = useCallback(() => {
    console.log('[useEnhancedChecklistItems] Refreshing enhanced checklist');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Calculate items on mount and when dependencies change
  useEffect(() => {
    calculateEnhancedChecklist();
  }, [calculateEnhancedChecklist, refreshTrigger]);

  return {
    checklistData,
    isAnalyzing,
    refreshChecklist
  };
};
