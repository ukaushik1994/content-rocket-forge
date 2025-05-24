
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useState, useCallback, useEffect } from 'react';
import { useContentAnalysis } from '@/hooks/final-review/useContentAnalysis';
import { ContentHumanizationAnalysis, analyzeContentHumanization } from '@/services/contentHumanizerService';
import { SerpUsageAnalysis, analyzeSerpIntegration } from '@/services/serpIntegrationService';

export interface ChecklistSection {
  id: string;
  title: string;
  items: Array<{title: string, passed: boolean}>;
  expanded: boolean;
  completionPercentage: number;
}

export const useEnhancedChecklistItems = () => {
  const { state } = useContentBuilder();
  const { 
    mainKeyword,
    metaTitle, 
    metaDescription, 
    documentStructure, 
    solutionIntegrationMetrics,
    selectedKeywords,
    content,
    serpSelections
  } = state;

  const { keywordUsage, ctaInfo } = useContentAnalysis();
  
  const [sections, setSections] = useState<ChecklistSection[]>([]);
  const [humanizationAnalysis, setHumanizationAnalysis] = useState<ContentHumanizationAnalysis | null>(null);
  const [serpAnalysis, setSerpAnalysis] = useState<SerpUsageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const calculateSections = useCallback(async () => {
    // Technical SEO Section
    const technicalItems = [
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
        title: 'Primary keyword has optimal density (0.5% - 3%)',
        passed: keywordUsage.some(k => k.keyword === mainKeyword && 
          parseFloat(k.density) >= 0.5 && 
          parseFloat(k.density) <= 3)
      }
    ];

    // Content Quality Section
    const contentQualityItems = [
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
        title: 'Secondary keywords are included in content',
        passed: selectedKeywords.filter(k => k !== mainKeyword).some(k => 
          keywordUsage.some(usage => usage.keyword === k && usage.count > 0)
        )
      }
    ];

    // SERP Integration Section
    let serpIntegrationItems = [];
    if (content && serpSelections.length > 0) {
      const analysis = await analyzeSerpIntegration(content, serpSelections);
      setSerpAnalysis(analysis);
      
      serpIntegrationItems = [
        {
          title: `SERP elements integrated (${analysis.integratedItems}/${analysis.totalSerpItems})`,
          passed: analysis.integrationScore >= 80
        },
        {
          title: 'Key questions from SERP are addressed',
          passed: analysis.wellIntegratedItems.filter(item => item.item.type === 'question').length > 0
        },
        {
          title: 'Related searches are incorporated',
          passed: analysis.wellIntegratedItems.filter(item => item.item.type === 'relatedSearch').length > 0
        },
        {
          title: 'Content gaps from SERP are filled',
          passed: analysis.missingItems.filter(item => item.type === 'contentGap').length === 0
        }
      ];
    }

    // Content Humanization Section
    let humanizationItems = [];
    if (content && content.length > 100) {
      try {
        const analysis = await analyzeContentHumanization(content);
        setHumanizationAnalysis(analysis);
        
        if (analysis) {
          humanizationItems = [
            {
              title: 'Content appears human-written',
              passed: analysis.aiLikelihoodScore < 30
            },
            {
              title: 'Natural conversational tone',
              passed: !analysis.detectedPatterns.some(p => p.type === 'formal_tone' && p.severity === 'high')
            },
            {
              title: 'Unique personality and voice',
              passed: !analysis.detectedPatterns.some(p => p.type === 'lack_personality' && p.severity === 'high')
            },
            {
              title: 'Varied sentence structure',
              passed: !analysis.detectedPatterns.some(p => p.type === 'predictable_structure' && p.severity === 'high')
            },
            {
              title: 'Original examples and insights',
              passed: !analysis.detectedPatterns.some(p => p.type === 'generic_examples' && p.severity === 'high')
            }
          ];
        }
      } catch (error) {
        console.error('Humanization analysis error:', error);
      }
    }

    const newSections: ChecklistSection[] = [
      {
        id: 'technical',
        title: 'Technical SEO',
        items: technicalItems,
        expanded: true,
        completionPercentage: Math.round((technicalItems.filter(i => i.passed).length / technicalItems.length) * 100)
      },
      {
        id: 'content-quality',
        title: 'Content Quality',
        items: contentQualityItems,
        expanded: false,
        completionPercentage: Math.round((contentQualityItems.filter(i => i.passed).length / contentQualityItems.length) * 100)
      }
    ];

    if (serpIntegrationItems.length > 0) {
      newSections.push({
        id: 'serp-integration',
        title: 'SERP Integration',
        items: serpIntegrationItems,
        expanded: false,
        completionPercentage: Math.round((serpIntegrationItems.filter(i => i.passed).length / serpIntegrationItems.length) * 100)
      });
    }

    if (humanizationItems.length > 0) {
      newSections.push({
        id: 'humanization',
        title: 'Content Humanization',
        items: humanizationItems,
        expanded: false,
        completionPercentage: Math.round((humanizationItems.filter(i => i.passed).length / humanizationItems.length) * 100)
      });
    }

    setSections(newSections);
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
    serpSelections,
    refreshTrigger
  ]);

  const refreshChecklist = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      await calculateSections();
    } finally {
      setIsAnalyzing(false);
    }
  }, [calculateSections]);

  const toggleSection = useCallback((sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, expanded: !section.expanded }
        : section
    ));
  }, []);

  useEffect(() => {
    calculateSections();
  }, [calculateSections]);

  const totalChecks = sections.reduce((sum, section) => sum + section.items.length, 0);
  const passedChecks = sections.reduce((sum, section) => sum + section.items.filter(i => i.passed).length, 0);
  const overallCompletionPercentage = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return {
    sections,
    totalChecks,
    passedChecks,
    overallCompletionPercentage,
    humanizationAnalysis,
    serpAnalysis,
    isAnalyzing,
    refreshChecklist,
    toggleSection
  };
};
