/**
 * Strategic Context Mapper for AI Suggestion Generation
 * Analyzes check types and injects relevant strategic context for precise AI suggestions
 */

import { ContentBuilderState } from '@/contexts/content-builder/types/state-types';

export interface StrategicContext {
  checkType: CheckType;
  contextData: Record<string, any>;
  promptEnhancement: string;
  relevantDataPoints: string[];
}

export type CheckType = 'seo' | 'solution' | 'content' | 'structure' | 'keywords' | 'readability' | 'general';

export class CheckContextMapper {
  private static instance: CheckContextMapper;
  
  static getInstance(): CheckContextMapper {
    if (!CheckContextMapper.instance) {
      CheckContextMapper.instance = new CheckContextMapper();
    }
    return CheckContextMapper.instance;
  }

  /**
   * Maps check title to strategic context based on ContentBuilderState
   */
  mapCheckToStrategicContext(
    checkTitle: string, 
    contentBuilderState: ContentBuilderState
  ): StrategicContext {
    const checkType = this.determineCheckType(checkTitle);
    
    switch (checkType) {
      case 'seo':
        return this.createSeoContext(checkTitle, contentBuilderState);
      case 'solution':
        return this.createSolutionContext(checkTitle, contentBuilderState);
      case 'keywords':
        return this.createKeywordContext(checkTitle, contentBuilderState);
      case 'content':
        return this.createContentContext(checkTitle, contentBuilderState);
      case 'structure':
        return this.createStructureContext(checkTitle, contentBuilderState);
      case 'readability':
        return this.createReadabilityContext(checkTitle, contentBuilderState);
      default:
        return this.createGeneralContext(checkTitle, contentBuilderState);
    }
  }

  private determineCheckType(checkTitle: string): CheckType {
    const title = checkTitle.toLowerCase();
    
    if (title.includes('seo') || title.includes('meta') || title.includes('title tag') || 
        title.includes('description') || title.includes('serp') || title.includes('ranking')) {
      return 'seo';
    }
    
    if (title.includes('solution') || title.includes('product') || title.includes('feature') || 
        title.includes('cta') || title.includes('call to action') || title.includes('integration')) {
      return 'solution';
    }
    
    if (title.includes('keyword') || title.includes('density') || title.includes('semantic') ||
        title.includes('lsi') || title.includes('topic cluster')) {
      return 'keywords';
    }
    
    if (title.includes('structure') || title.includes('heading') || title.includes('h1') || 
        title.includes('outline') || title.includes('section') || title.includes('hierarchy')) {
      return 'structure';
    }
    
    if (title.includes('readability') || title.includes('sentence') || title.includes('paragraph') ||
        title.includes('flesch') || title.includes('grade level') || title.includes('clarity')) {
      return 'readability';
    }
    
    if (title.includes('content') || title.includes('engagement') || title.includes('value') ||
        title.includes('audience') || title.includes('tone') || title.includes('voice')) {
      return 'content';
    }
    
    return 'general';
  }

  private createSeoContext(checkTitle: string, state: ContentBuilderState): StrategicContext {
    const contextData: Record<string, any> = {
      mainKeyword: state.mainKeyword,
      selectedKeywords: state.selectedKeywords,
      searchedKeywords: state.searchedKeywords,
      serpData: state.serpData,
      comprehensiveSerpData: state.comprehensiveSerpData,
      serpSelections: state.serpSelections,
      metaTitle: state.metaTitle,
      metaDescription: state.metaDescription,
      seoScore: state.seoScore,
      seoImprovements: state.seoImprovements
    };

    const promptEnhancement = this.createSeoPromptEnhancement(contextData);
    
    return {
      checkType: 'seo',
      contextData,
      promptEnhancement,
      relevantDataPoints: [
        'SERP competitor analysis',
        'Keyword ranking patterns',
        'Meta optimization opportunities',
        'Content-keyword alignment',
        'Search intent matching'
      ]
    };
  }

  private createSolutionContext(checkTitle: string, state: ContentBuilderState): StrategicContext {
    const contextData: Record<string, any> = {
      selectedSolution: state.selectedSolution,
      solutionIntegrationMetrics: state.solutionIntegrationMetrics,
      contentType: state.contentType,
      contentIntent: state.contentIntent,
      targetAudience: state.selectedSolution?.targetAudience || [],
      painPoints: state.selectedSolution?.painPoints || [],
      features: state.selectedSolution?.features || [],
      useCases: state.selectedSolution?.useCases || []
    };

    const promptEnhancement = this.createSolutionPromptEnhancement(contextData);
    
    return {
      checkType: 'solution',
      contextData,
      promptEnhancement,
      relevantDataPoints: [
        'Solution-content alignment',
        'Feature integration opportunities',
        'Pain point addressing',
        'Target audience resonance',
        'Call-to-action effectiveness'
      ]
    };
  }

  private createKeywordContext(checkTitle: string, state: ContentBuilderState): StrategicContext {
    const contextData: Record<string, any> = {
      mainKeyword: state.mainKeyword,
      selectedKeywords: state.selectedKeywords,
      searchedKeywords: state.searchedKeywords,
      selectedCluster: state.selectedCluster,
      contentType: state.contentType,
      serpData: state.serpData
    };

    const promptEnhancement = this.createKeywordPromptEnhancement(contextData);
    
    return {
      checkType: 'keywords',
      contextData,
      promptEnhancement,
      relevantDataPoints: [
        'Keyword density analysis',
        'Semantic keyword opportunities',
        'LSI keyword integration',
        'Topic cluster alignment',
        'Search intent coverage'
      ]
    };
  }

  private createContentContext(checkTitle: string, state: ContentBuilderState): StrategicContext {
    const contextData: Record<string, any> = {
      contentType: state.contentType,
      contentFormat: state.contentFormat,
      contentIntent: state.contentIntent,
      selectedSolution: state.selectedSolution,
      outline: state.outline,
      outlineSections: state.outlineSections,
      additionalInstructions: state.additionalInstructions,
      location: state.location
    };

    const promptEnhancement = this.createContentPromptEnhancement(contextData);
    
    return {
      checkType: 'content',
      contextData,
      promptEnhancement,
      relevantDataPoints: [
        'Content strategy alignment',
        'Audience engagement optimization',
        'Value proposition clarity',
        'Content format best practices',
        'Geographic relevance'
      ]
    };
  }

  private createStructureContext(checkTitle: string, state: ContentBuilderState): StrategicContext {
    const contextData: Record<string, any> = {
      outline: state.outline,
      outlineSections: state.outlineSections,
      documentStructure: state.documentStructure,
      contentFormat: state.contentFormat,
      contentType: state.contentType
    };

    const promptEnhancement = this.createStructurePromptEnhancement(contextData);
    
    return {
      checkType: 'structure',
      contextData,
      promptEnhancement,
      relevantDataPoints: [
        'Heading hierarchy optimization',
        'Section flow improvement',
        'Content organization',
        'Readability structure',
        'Format-specific requirements'
      ]
    };
  }

  private createReadabilityContext(checkTitle: string, state: ContentBuilderState): StrategicContext {
    const contextData: Record<string, any> = {
      contentType: state.contentType,
      selectedSolution: state.selectedSolution?.targetAudience || [],
      location: state.location,
      contentFormat: state.contentFormat
    };

    const promptEnhancement = this.createReadabilityPromptEnhancement(contextData);
    
    return {
      checkType: 'readability',
      contextData,
      promptEnhancement,
      relevantDataPoints: [
        'Sentence complexity analysis',
        'Paragraph length optimization',
        'Audience-appropriate language',
        'Content clarity enhancement',
        'Flow and coherence improvement'
      ]
    };
  }

  private createGeneralContext(checkTitle: string, state: ContentBuilderState): StrategicContext {
    const contextData: Record<string, any> = {
      contentType: state.contentType,
      mainKeyword: state.mainKeyword,
      selectedSolution: state.selectedSolution,
      additionalInstructions: state.additionalInstructions
    };

    const promptEnhancement = `General optimization context for: ${checkTitle}`;
    
    return {
      checkType: 'general',
      contextData,
      promptEnhancement,
      relevantDataPoints: [
        'Overall content quality',
        'General optimization opportunities',
        'Content effectiveness',
        'User experience enhancement'
      ]
    };
  }

  // Prompt enhancement creators
  private createSeoPromptEnhancement(contextData: Record<string, any>): string {
    const parts = [];
    
    if (contextData.mainKeyword) {
      parts.push(`PRIMARY KEYWORD: "${contextData.mainKeyword}"`);
    }
    
    if (contextData.selectedKeywords?.length) {
      parts.push(`SECONDARY KEYWORDS: ${contextData.selectedKeywords.join(', ')}`);
    }
    
    if (contextData.comprehensiveSerpData) {
      parts.push(`SERP ANALYSIS: Top-ranking content patterns analyzed for optimization insights`);
    }
    
    if (contextData.serpSelections?.length) {
      parts.push(`COMPETITOR INSIGHTS: ${contextData.serpSelections.length} top-performing pages selected for reference`);
    }

    if (contextData.seoScore) {
      parts.push(`CURRENT SEO SCORE: ${contextData.seoScore}/100`);
    }

    return parts.join('\n');
  }

  private createSolutionPromptEnhancement(contextData: Record<string, any>): string {
    const parts = [];
    
    if (contextData.selectedSolution) {
      const solution = contextData.selectedSolution;
      parts.push(`SOLUTION PROFILE:`);
      parts.push(`- Name: ${solution.name}`);
      parts.push(`- Category: ${solution.category}`);
      
      if (solution.features?.length) {
        parts.push(`- Key Features: ${solution.features.slice(0, 3).join(', ')}`);
      }
      
      if (solution.painPoints?.length) {
        parts.push(`- Addresses Pain Points: ${solution.painPoints.slice(0, 3).join(', ')}`);
      }
      
      if (solution.targetAudience?.length) {
        parts.push(`- Target Audience: ${solution.targetAudience.slice(0, 3).join(', ')}`);
      }
    }
    
    if (contextData.solutionIntegrationMetrics) {
      const metrics = contextData.solutionIntegrationMetrics;
      parts.push(`INTEGRATION METRICS:`);
      parts.push(`- Current Integration Score: ${metrics.overallScore || 0}/100`);
      parts.push(`- Feature Mentions: ${metrics.mentions || 0}`);
      parts.push(`- Pain Points Addressed: ${metrics.painPointsAddressed?.length || 0}`);
    }

    return parts.join('\n');
  }

  private createKeywordPromptEnhancement(contextData: Record<string, any>): string {
    const parts = [];
    
    if (contextData.mainKeyword) {
      parts.push(`PRIMARY FOCUS KEYWORD: "${contextData.mainKeyword}"`);
    }
    
    if (contextData.selectedKeywords?.length) {
      parts.push(`SEMANTIC KEYWORDS: ${contextData.selectedKeywords.join(', ')}`);
    }
    
    if (contextData.selectedCluster) {
      parts.push(`TOPIC CLUSTER: "${contextData.selectedCluster.name}" with ${contextData.selectedCluster.keywords?.length || 0} related terms`);
    }

    return parts.join('\n');
  }

  private createContentPromptEnhancement(contextData: Record<string, any>): string {
    const parts = [];
    
    if (contextData.contentType && contextData.contentFormat) {
      parts.push(`CONTENT STRATEGY: ${contextData.contentType} in ${contextData.contentFormat} format`);
    }
    
    if (contextData.contentIntent) {
      parts.push(`CONTENT INTENT: ${contextData.contentIntent}`);
    }
    
    if (contextData.location) {
      parts.push(`GEOGRAPHIC FOCUS: ${contextData.location}`);
    }
    
    if (contextData.additionalInstructions) {
      parts.push(`SPECIAL INSTRUCTIONS: ${contextData.additionalInstructions}`);
    }

    return parts.join('\n');
  }

  private createStructurePromptEnhancement(contextData: Record<string, any>): string {
    const parts = [];
    
    if (contextData.outlineSections?.length) {
      parts.push(`CONTENT OUTLINE: ${contextData.outlineSections.length} main sections planned`);
    }
    
    if (contextData.contentFormat) {
      parts.push(`FORMAT REQUIREMENTS: Optimized for ${contextData.contentFormat}`);
    }
    
    if (contextData.documentStructure) {
      parts.push(`DOCUMENT STRUCTURE: Defined hierarchy and organization`);
    }

    return parts.join('\n');
  }

  private createReadabilityPromptEnhancement(contextData: Record<string, any>): string {
    const parts = [];
    
    if (contextData.selectedSolution?.length) {
      parts.push(`TARGET AUDIENCE: ${contextData.selectedSolution.join(', ')}`);
    }
    
    if (contextData.contentType) {
      parts.push(`CONTENT TYPE: ${contextData.contentType} (requires appropriate reading level)`);
    }

    return parts.join('\n');
  }
}