import { ContentBuilderState } from '@/contexts/content-builder/types';

interface StrategicContext {
  checkType: string;
  promptEnhancement: string;
  contextualHints: string[];
  focusAreas: string[];
}

export class CheckContextMapper {
  private static instance: CheckContextMapper;

  static getInstance(): CheckContextMapper {
    if (!CheckContextMapper.instance) {
      CheckContextMapper.instance = new CheckContextMapper();
    }
    return CheckContextMapper.instance;
  }

  mapCheckToStrategicContext(checkTitle: string, state: ContentBuilderState): StrategicContext {
    const lowercaseTitle = checkTitle.toLowerCase();
    
    // Map check titles to strategic contexts
    if (lowercaseTitle.includes('readability') || lowercaseTitle.includes('reading')) {
      return this.createReadabilityContext(state);
    }
    
    if (lowercaseTitle.includes('seo') || lowercaseTitle.includes('keyword')) {
      return this.createSEOContext(state);
    }
    
    if (lowercaseTitle.includes('engagement') || lowercaseTitle.includes('hook')) {
      return this.createEngagementContext(state);
    }
    
    if (lowercaseTitle.includes('structure') || lowercaseTitle.includes('organization')) {
      return this.createStructureContext(state);
    }
    
    if (lowercaseTitle.includes('clarity') || lowercaseTitle.includes('clear')) {
      return this.createClarityContext(state);
    }
    
    if (lowercaseTitle.includes('flow') || lowercaseTitle.includes('transition')) {
      return this.createFlowContext(state);
    }
    
    // Default context for unrecognized checks
    return this.createGeneralContext(checkTitle, state);
  }

  private createReadabilityContext(state: ContentBuilderState): StrategicContext {
    return {
      checkType: 'readability',
      promptEnhancement: `Focus on improving text readability and accessibility. Consider sentence length, word complexity, and paragraph structure. Target audience reading comprehension level should be appropriate.`,
      contextualHints: [
        'Break down complex sentences into simpler ones',
        'Replace jargon with everyday language',
        'Vary sentence lengths for better flow',
        'Use active voice over passive voice'
      ],
      focusAreas: ['sentence_structure', 'vocabulary', 'paragraph_length', 'voice']
    };
  }

  private createSEOContext(state: ContentBuilderState): StrategicContext {
    const keyword = state.mainKeyword || '';
    const keywords = state.selectedKeywords || [];
    
    return {
      checkType: 'seo',
      promptEnhancement: `Optimize content for search engines while maintaining natural readability. Primary keyword: "${keyword}". Related keywords: ${keywords.join(', ')}. Focus on strategic keyword placement and semantic relevance.`,
      contextualHints: [
        'Naturally integrate primary and related keywords',
        'Improve title tags and headings for SEO',
        'Enhance meta descriptions and content snippets',
        'Add semantic keywords and variations'
      ],
      focusAreas: ['keyword_optimization', 'semantic_relevance', 'title_optimization', 'meta_content']
    };
  }

  private createEngagementContext(state: ContentBuilderState): StrategicContext {
    return {
      checkType: 'engagement',
      promptEnhancement: `Enhance content engagement and reader interest. Focus on compelling hooks, emotional connection, and actionable insights that keep readers engaged throughout the content.`,
      contextualHints: [
        'Create stronger opening hooks',
        'Add compelling examples and stories',
        'Include actionable tips and insights',
        'Use engaging questions and calls-to-action'
      ],
      focusAreas: ['opening_hooks', 'storytelling', 'actionability', 'reader_connection']
    };
  }

  private createStructureContext(state: ContentBuilderState): StrategicContext {
    return {
      checkType: 'structure',
      promptEnhancement: `Improve content organization and logical flow. Focus on clear hierarchy, smooth transitions between sections, and logical information architecture.`,
      contextualHints: [
        'Improve heading hierarchy and organization',
        'Add clear transitions between sections',
        'Reorganize information for better flow',
        'Enhance bullet points and list structures'
      ],
      focusAreas: ['heading_hierarchy', 'transitions', 'information_flow', 'list_organization']
    };
  }

  private createClarityContext(state: ContentBuilderState): StrategicContext {
    return {
      checkType: 'clarity',
      promptEnhancement: `Enhance content clarity and comprehension. Focus on precise language, clear explanations, and removing ambiguity or confusion.`,
      contextualHints: [
        'Clarify vague or ambiguous statements',
        'Provide clearer explanations and definitions',
        'Remove redundant or confusing phrases',
        'Improve precision in language and terminology'
      ],
      focusAreas: ['precision', 'explanations', 'ambiguity_removal', 'terminology']
    };
  }

  private createFlowContext(state: ContentBuilderState): StrategicContext {
    return {
      checkType: 'flow',
      promptEnhancement: `Improve content flow and coherence. Focus on smooth transitions, logical progression of ideas, and maintaining reader momentum throughout the piece.`,
      contextualHints: [
        'Add smooth transitions between paragraphs',
        'Improve logical sequence of information',
        'Enhance connection between ideas',
        'Create better narrative progression'
      ],
      focusAreas: ['transitions', 'logical_progression', 'idea_connection', 'narrative_flow']
    };
  }

  private createGeneralContext(checkTitle: string, state: ContentBuilderState): StrategicContext {
    return {
      checkType: 'general',
      promptEnhancement: `Improve content quality related to: ${checkTitle}. Focus on enhancing the specific aspect mentioned while maintaining overall content coherence and value.`,
      contextualHints: [
        'Address the specific issue mentioned in the check',
        'Maintain content quality and consistency',
        'Provide actionable improvements',
        'Ensure changes align with content goals'
      ],
      focusAreas: ['specific_improvement', 'quality_maintenance', 'goal_alignment', 'coherence']
    };
  }
}