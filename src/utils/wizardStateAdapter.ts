/**
 * Adapter: maps WizardState → ContentBuilderState
 * Enables reuse of Content Builder services (quality analysis, compliance) in the Content Wizard.
 */

import type { WizardState } from '@/components/ai-chat/content-wizard/ContentWizardSidebar';
import { ContentBuilderState } from '@/contexts/content-builder/types/state-types';

/**
 * Creates a lightweight ContentBuilderState from WizardState.
 * Only populates fields actually used by analyzeContentQualityWithAI() and analyzeContentCompliance().
 */
export function wizardToBuilderState(
  wizardState: WizardState,
  editableContent: string
): ContentBuilderState {
  // Map research selections → SERP selections format
  const serpSelections = [
    ...wizardState.researchSelections.faqs.map(f => ({
      type: 'question' as const,
      content: f,
      source: 'serp',
      selected: true,
    })),
    ...wizardState.researchSelections.contentGaps.map(g => ({
      type: 'contentGap' as const,
      content: g,
      source: 'serp',
      selected: true,
    })),
    ...wizardState.researchSelections.relatedKeywords.map(k => ({
      type: 'keyword' as const,
      content: k,
      source: 'serp',
      selected: true,
    })),
    ...wizardState.researchSelections.serpHeadings.map(h => ({
      type: 'heading' as const,
      content: h,
      source: 'serp',
      selected: true,
    })),
  ];

  // Map outline sections
  const outlineSections = wizardState.outline.map((section, idx) => ({
    id: `wizard-section-${idx}`,
    title: section.title,
    level: section.level,
    content: '',
    isExpanded: true,
    order: idx,
  }));

  return {
    // Navigation (not used by services, but required by type)
    activeStep: 5,
    steps: [],

    // Keywords
    mainKeyword: wizardState.keyword,
    selectedKeywords: wizardState.researchSelections.relatedKeywords,
    searchedKeywords: [wizardState.keyword],

    // Content Type
    contentType: (wizardState.contentType === 'blog' ? 'blog_post' : wizardState.contentType) as any,
    contentFormat: 'long_form' as any,
    contentIntent: (wizardState.contentBrief.contentGoal || 'inform') as any,

    // Solution
    selectedSolution: wizardState.selectedSolution || null,

    // Titles
    contentTitle: wizardState.title || wizardState.metaTitle || '',
    suggestedTitles: [],

    // SERP Data
    serpData: wizardState.serpData || null,
    serpSelections: serpSelections as any,
    isAnalyzing: false,
    comprehensiveSerpData: null,

    // Outline
    outline: wizardState.outline.map(s => s.title),
    outlineSections,

    // Content
    content: editableContent,
    isGenerating: false,
    isSaving: false,

    // SEO
    seoScore: 0,
    seoImprovements: [],
    optimizationSkipped: false,

    // Cluster
    selectedCluster: null,

    // Meta
    metaTitle: wizardState.metaTitle || null,
    metaDescription: wizardState.metaDescription || null,

    // Document Structure
    documentStructure: null,

    // Solution Integration
    solutionIntegrationMetrics: null,

    // Additional
    additionalInstructions: wizardState.additionalInstructions || '',
    location: '',
    strategySource: null,

    // Word Count
    aiEstimatedWordCount: wizardState.wordCount,
    wordCountMode: wizardState.wordCountMode,

    // Content Brief
    contentBrief: {
      targetAudience: wizardState.contentBrief.targetAudience || '',
      contentGoal: wizardState.contentBrief.contentGoal || '',
      tone: wizardState.contentBrief.tone || '',
      specificPoints: wizardState.contentBrief.specificPoints || '',
    },
  };
}
