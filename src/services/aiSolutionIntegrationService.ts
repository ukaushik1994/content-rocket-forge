import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { ContentType, ContentIntent } from '@/contexts/content-builder/types';

interface SolutionContext {
  solution: EnhancedSolution;
  contentType: ContentType;
  contentIntent: ContentIntent;
  targetKeywords: string[];
  audience?: string;
}

export class AISolutionIntegrationService {
  /**
   * Creates solution-aware prompts for content generation
   */
  static createSolutionAwarePrompt(context: SolutionContext, basePrompt: string): string {
    const { solution, contentType, contentIntent, targetKeywords, audience } = context;
    
    const solutionContext = this.buildSolutionContext(solution);
    const audienceContext = audience || solution.targetAudience.join(', ');
    
    return `${basePrompt}

SOLUTION CONTEXT:
${solutionContext}

TARGET AUDIENCE: ${audienceContext}

CONTENT REQUIREMENTS:
- Content Type: ${contentType}
- Content Intent: ${contentIntent}
- Target Keywords: ${targetKeywords.join(', ')}

INTEGRATION GUIDELINES:
- Naturally incorporate the solution's value propositions: ${solution.uniqueValuePropositions?.join(', ') || 'N/A'}
- Address relevant pain points: ${solution.painPoints.join(', ')}
- Highlight applicable features: ${solution.features.slice(0, 3).join(', ')}
- Use appropriate use cases as examples: ${solution.useCases.slice(0, 2).join(', ')}
- Mention key differentiators when relevant: ${solution.keyDifferentiators?.join(', ') || 'N/A'}

${this.getContentTypeSpecificGuidelines(contentType, solution)}`;
  }

  /**
   * Builds comprehensive solution context for AI prompts
   */
  private static buildSolutionContext(solution: EnhancedSolution): string {
    let context = `SOLUTION: ${solution.name}
DESCRIPTION: ${solution.description}
CATEGORY: ${solution.category}`;

    if (solution.positioningStatement) {
      context += `\nPOSITIONING: ${solution.positioningStatement}`;
    }

    if (solution.marketData && Object.keys(solution.marketData).length > 0) {
      context += `\nMARKET DATA: ${JSON.stringify(solution.marketData)}`;
    }

    if (solution.competitors && solution.competitors.length > 0) {
      context += `\nCOMPETITOR LANDSCAPE: ${solution.competitors.map(c => c.name).join(', ')}`;
    }

    if (solution.technicalSpecs && Object.keys(solution.technicalSpecs).length > 0) {
      context += `\nTECHNICAL CAPABILITIES: ${this.formatTechnicalSpecs(solution.technicalSpecs)}`;
    }

    if (solution.caseStudies && solution.caseStudies.length > 0) {
      context += `\nCASE STUDIES: ${solution.caseStudies.map(cs => `${cs.company} - ${cs.results.join(', ')}`).join('; ')}`;
    }

    return context;
  }

  /**
   * Provides content type specific integration guidelines
   */
  private static getContentTypeSpecificGuidelines(contentType: ContentType, solution: EnhancedSolution): string {
    switch (contentType) {
      case 'blog':
        return `BLOG SPECIFIC GUIDELINES:
- Include relevant case studies as examples
- Add technical specifications if applicable to the topic
- Include internal links to solution resources
- End with a clear call-to-action mentioning the solution`;

      case 'article':
        return `ARTICLE SPECIFIC GUIDELINES:
- Provide in-depth analysis using solution data
- Include market data and competitive insights where relevant
- Reference specific metrics and performance indicators
- Maintain authoritative tone with solution expertise`;

      case 'landingPage':
        return `LANDING PAGE SPECIFIC GUIDELINES:
- Include step-by-step processes relevant to the solution
- Reference technical specifications and requirements
- Provide practical examples from case studies
- Include troubleshooting tips based on solution capabilities`;

      case 'productDescription':
        return `PRODUCT DESCRIPTION SPECIFIC GUIDELINES:
- Use competitor analysis data for accurate comparisons
- Highlight unique differentiators objectively
- Include pricing model information where relevant
- Reference specific features and capabilities`;

      default:
        return `GENERAL INTEGRATION GUIDELINES:
- Naturally weave solution benefits throughout the content
- Use solution-specific terminology and industry language
- Include relevant examples and use cases
- Maintain authenticity and avoid over-promotion`;
    }
  }

  /**
   * Formats technical specifications for AI context
   */
  private static formatTechnicalSpecs(technicalSpecs: any): string {
    const specs = [];
    
    if (technicalSpecs.systemRequirements) {
      specs.push(`System Requirements: ${technicalSpecs.systemRequirements.join(', ')}`);
    }
    
    if (technicalSpecs.supportedPlatforms) {
      specs.push(`Platforms: ${technicalSpecs.supportedPlatforms.join(', ')}`);
    }
    
    if (technicalSpecs.apiCapabilities) {
      specs.push(`API: ${technicalSpecs.apiCapabilities.join(', ')}`);
    }
    
    if (technicalSpecs.securityFeatures) {
      specs.push(`Security: ${technicalSpecs.securityFeatures.join(', ')}`);
    }
    
    return specs.join('; ');
  }

  /**
   * Generates solution-specific call-to-action suggestions
   */
  static generateCTASuggestions(solution: EnhancedSolution, contentIntent: ContentIntent): string[] {
    const ctas = [];
    
    switch (contentIntent) {
      case 'educate':
        ctas.push(`Learn more about how ${solution.name} can solve these challenges`);
        ctas.push(`Explore ${solution.name}'s comprehensive features`);
        break;
        
      case 'convert':
        ctas.push(`Try ${solution.name} free for 14 days`);
        ctas.push(`See ${solution.name} in action with a demo`);
        ctas.push(`Get started with ${solution.name} today`);
        break;
        
      case 'inform':
        ctas.push(`Discover how ${solution.name} fits your needs`);
        ctas.push(`Compare ${solution.name} with alternatives`);
        break;
        
      default:
        ctas.push(`Learn more about ${solution.name}`);
        ctas.push(`Explore ${solution.name} solutions`);
    }
    
    if (solution.externalUrl) {
      ctas.push(`Visit ${solution.name} official website`);
    }
    
    return ctas;
  }

  /**
   * Analyzes content for solution integration quality
   */
  static analyzeSolutionIntegration(content: string, solution: EnhancedSolution): {
    score: number;
    feedback: string[];
    suggestions: string[];
  } {
    const feedback = [];
    const suggestions = [];
    let score = 0;
    
    // Check for solution name mentions
    const nameMentions = (content.toLowerCase().match(new RegExp(solution.name.toLowerCase(), 'g')) || []).length;
    if (nameMentions > 0) {
      score += 20;
      feedback.push(`Solution mentioned ${nameMentions} time(s)`);
    } else {
      suggestions.push(`Consider mentioning ${solution.name} by name`);
    }
    
    // Check for feature mentions
    const mentionedFeatures = solution.features.filter(feature => 
      content.toLowerCase().includes(feature.toLowerCase())
    );
    if (mentionedFeatures.length > 0) {
      score += 25;
      feedback.push(`Features mentioned: ${mentionedFeatures.join(', ')}`);
    } else {
      suggestions.push(`Include specific features like: ${solution.features.slice(0, 2).join(', ')}`);
    }
    
    // Check for pain point coverage
    const addressedPainPoints = solution.painPoints.filter(pain => 
      content.toLowerCase().includes(pain.toLowerCase())
    );
    if (addressedPainPoints.length > 0) {
      score += 25;
      feedback.push(`Pain points addressed: ${addressedPainPoints.join(', ')}`);
    } else {
      suggestions.push(`Address pain points like: ${solution.painPoints.slice(0, 2).join(', ')}`);
    }
    
    // Check for use case examples
    const mentionedUseCases = solution.useCases.filter(useCase => 
      content.toLowerCase().includes(useCase.toLowerCase())
    );
    if (mentionedUseCases.length > 0) {
      score += 15;
      feedback.push(`Use cases covered: ${mentionedUseCases.join(', ')}`);
    } else {
      suggestions.push(`Include use case examples like: ${solution.useCases.slice(0, 2).join(', ')}`);
    }
    
    // Check for value proposition integration
    if (solution.uniqueValuePropositions) {
      const mentionedVPs = solution.uniqueValuePropositions.filter(vp => 
        content.toLowerCase().includes(vp.toLowerCase())
      );
      if (mentionedVPs.length > 0) {
        score += 15;
        feedback.push(`Value propositions highlighted: ${mentionedVPs.join(', ')}`);
      } else {
        suggestions.push(`Highlight value propositions: ${solution.uniqueValuePropositions.slice(0, 2).join(', ')}`);
      }
    }
    
    return {
      score: Math.min(score, 100),
      feedback,
      suggestions
    };
  }
}