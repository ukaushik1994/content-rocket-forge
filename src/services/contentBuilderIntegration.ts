
import { supabase } from '@/integrations/supabase/client';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

export interface ContentBuilderState {
  currentStep: number;
  stepNames: string[];
  completedSteps: number[];
  mainKeyword: string;
  selectedKeywords: string[];
  selectedSerpItems: any[];
  outline: any[];
  content: string;
  title: string;
  seoScore?: number;
  hasAnalyzedSeo: boolean;
  canProceedToNext: boolean;
}

export interface ContentBuilderInsights {
  currentStepName: string;
  nextStepName?: string;
  recommendedActions: string[];
  blockers: string[];
  progress: number;
  contextualHelp: string;
}

class ContentBuilderIntegrationService {
  private stepNames = [
    'Keyword Selection',
    'SERP Analysis', 
    'Content Type & Outline',
    'Content Writing',
    'Optimization & Review',
    'Save & Publish'
  ];

  async getContentBuilderState(): Promise<ContentBuilderState | null> {
    try {
      // In a real implementation, this would get the actual Content Builder state
      // For now, we'll return a mock state that represents the current workflow
      return {
        currentStep: 1,
        stepNames: this.stepNames,
        completedSteps: [0],
        mainKeyword: '',
        selectedKeywords: [],
        selectedSerpItems: [],
        outline: [],
        content: '',
        title: '',
        hasAnalyzedSeo: false,
        canProceedToNext: false
      };
    } catch (error) {
      console.error('Error getting Content Builder state:', error);
      return null;
    }
  }

  generateInsights(state: ContentBuilderState): ContentBuilderInsights {
    const currentStepName = this.stepNames[state.currentStep];
    const nextStepName = state.currentStep < this.stepNames.length - 1 
      ? this.stepNames[state.currentStep + 1] 
      : undefined;
    
    const progress = (state.completedSteps.length / this.stepNames.length) * 100;
    
    let recommendedActions: string[] = [];
    let blockers: string[] = [];
    let contextualHelp = '';

    switch (state.currentStep) {
      case 0: // Keyword Selection
        if (!state.mainKeyword) {
          blockers.push('Main keyword not selected');
          recommendedActions.push('Select a main keyword to target');
          contextualHelp = 'Start by choosing a primary keyword that represents your content topic. This will guide the entire content creation process.';
        } else {
          recommendedActions.push('Add related keywords to strengthen your content');
          contextualHelp = 'Great! You have a main keyword. Consider adding 2-5 related keywords to make your content more comprehensive.';
        }
        break;
        
      case 1: // SERP Analysis
        if (state.selectedSerpItems.length === 0) {
          blockers.push('No SERP analysis performed');
          recommendedActions.push('Analyze SERP results for your keywords');
          contextualHelp = 'Analyze the search engine results to understand what content ranks well and identify opportunities for your content.';
        } else {
          recommendedActions.push('Review competitor analysis and select relevant insights');
          contextualHelp = 'Use the SERP analysis to understand competitor content structure and identify content gaps you can fill.';
        }
        break;
        
      case 2: // Content Type & Outline
        if (state.outline.length === 0) {
          blockers.push('Content outline not created');
          recommendedActions.push('Create or generate a content outline');
          contextualHelp = 'Build a structured outline based on your SERP analysis. This will be the foundation of your content.';
        } else {
          recommendedActions.push('Review and refine your outline structure');
          contextualHelp = 'Your outline looks good! Make sure it covers all the key points from your SERP analysis.';
        }
        break;
        
      case 3: // Content Writing
        if (!state.content || state.content.length < 100) {
          blockers.push('Content not written');
          recommendedActions.push('Write or generate content based on your outline');
          contextualHelp = 'Start writing your content following the outline structure. You can generate content automatically or write it manually.';
        } else {
          recommendedActions.push('Review and polish your content');
          contextualHelp = 'Great progress on your content! Review it for clarity, completeness, and alignment with your keywords.';
        }
        break;
        
      case 4: // Optimization & Review
        if (!state.hasAnalyzedSeo) {
          blockers.push('SEO analysis not performed');
          recommendedActions.push('Run SEO analysis on your content');
          contextualHelp = 'Analyze your content for SEO optimization opportunities to improve its search ranking potential.';
        } else if (state.seoScore && state.seoScore < 70) {
          recommendedActions.push('Apply SEO improvements to boost your score');
          contextualHelp = 'Your SEO score can be improved. Apply the suggested optimizations to enhance your content\'s search visibility.';
        } else {
          recommendedActions.push('Final review before publishing');
          contextualHelp = 'Excellent SEO score! Do a final review of your content before saving and publishing.';
        }
        break;
        
      case 5: // Save & Publish
        recommendedActions.push('Save your content and publish');
        contextualHelp = 'Your content is ready! Choose whether to save as draft or publish directly.';
        break;
    }

    return {
      currentStepName,
      nextStepName,
      recommendedActions,
      blockers,
      progress,
      contextualHelp
    };
  }

  async executeWorkflowAction(action: string, parameters: any = {}): Promise<any> {
    switch (action) {
      case 'navigate_to_step':
        return { success: true, message: `Navigated to step ${parameters.step}` };
      
      case 'add_keyword':
        return { success: true, message: `Added keyword: ${parameters.keyword}` };
      
      case 'analyze_serp':
        return { success: true, message: `Analyzing SERP for: ${parameters.keyword}` };
      
      case 'generate_outline':
        return { success: true, message: 'Generated content outline based on SERP analysis' };
      
      case 'generate_content':
        return { success: true, message: 'Generated content based on outline' };
      
      case 'analyze_seo':
        return { success: true, message: 'Performed SEO analysis on content' };
      
      default:
        throw new Error(`Unknown workflow action: ${action}`);
    }
  }
}

export const contentBuilderIntegration = new ContentBuilderIntegrationService();
