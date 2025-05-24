
import { debounce } from 'lodash';
import { sendChatRequest } from '@/services/aiService';
import { SerpAnalysisResult, TopResult } from '@/types/serp';

export interface SeoContentRequest {
  mainKeyword: string;
  secondaryKeywords: string[];
  serpData: SerpAnalysisResult;
  contentType: 'comprehensive' | 'faq' | 'listicle' | 'comparison' | 'guide';
  targetWordCount: number;
  userIntent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  competitorAnalysis?: CompetitorContent[];
}

export interface CompetitorContent {
  title: string;
  headings: string[];
  entities: string[];
  keyTopics: string[];
  wordCount: number;
  contentGaps: string[];
}

export interface SeoContentResult {
  title: string;
  metaDescription: string;
  content: string;
  outline: string[];
  entities: string[];
  semanticKeywords: string[];
  contentScore: number;
  rankingPotential: 'high' | 'medium' | 'low';
  suggestions: string[];
}

class AdvancedSeoContentGenerator {
  private generateCallback?: (result: SeoContentResult) => void;
  private debouncedGenerate: (request: SeoContentRequest) => void;

  constructor() {
    this.debouncedGenerate = debounce(this.performGeneration.bind(this), 300);
  }

  setCallback(callback: (result: SeoContentResult) => void) {
    this.generateCallback = callback;
  }

  async generateSeoContent(request: SeoContentRequest) {
    this.debouncedGenerate(request);
  }

  private async performGeneration(request: SeoContentRequest): Promise<void> {
    try {
      // Analyze competitors and extract patterns
      const competitorAnalysis = await this.analyzeCompetitors(request.serpData);
      
      // Extract entities and semantic keywords
      const entityData = await this.extractEntities(request);
      
      // Generate SEO-optimized content
      const contentResult = await this.generateOptimizedContent(request, competitorAnalysis, entityData);
      
      this.generateCallback?.(contentResult);
    } catch (error) {
      console.error('Advanced SEO content generation error:', error);
    }
  }

  private async analyzeCompetitors(serpData: SerpAnalysisResult): Promise<CompetitorContent[]> {
    if (!serpData?.topResults) return [];

    return serpData.topResults.slice(0, 5).map((result: TopResult) => ({
      title: result.title,
      headings: this.extractHeadings(result.snippet),
      entities: this.extractEntitiesFromText(result.snippet),
      keyTopics: this.extractKeyTopics(result.snippet),
      wordCount: result.snippet.split(' ').length * 10, // Estimate
      contentGaps: []
    }));
  }

  private async extractEntities(request: SeoContentRequest) {
    // Extract entities from SERP data
    const entities = [
      ...this.extractEntitiesFromSerp(request.serpData),
      ...request.secondaryKeywords
    ];

    // Generate semantic keywords based on main keyword
    const semanticKeywords = await this.generateSemanticKeywords(request.mainKeyword);

    return { entities, semanticKeywords };
  }

  private async generateOptimizedContent(
    request: SeoContentRequest,
    competitors: CompetitorContent[],
    entityData: any
  ): Promise<SeoContentResult> {
    // Create comprehensive prompt for SEO content generation
    const prompt = this.createSeoContentPrompt(request, competitors, entityData);
    
    try {
      const response = await sendChatRequest('openai', {
        messages: [
          { 
            role: 'system', 
            content: this.createSeoSystemPrompt(request.contentType, request.userIntent)
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        maxTokens: 4000
      });

      if (response?.choices?.[0]?.message?.content) {
        const generatedContent = response.choices[0].message.content;
        return this.parseGeneratedContent(generatedContent, request, entityData);
      }
    } catch (error) {
      console.error('Error generating SEO content:', error);
    }

    // Fallback response
    return this.createFallbackContent(request);
  }

  private createSeoContentPrompt(
    request: SeoContentRequest,
    competitors: CompetitorContent[],
    entityData: any
  ): string {
    const { mainKeyword, serpData, contentType, targetWordCount, userIntent } = request;

    let prompt = `Generate highly SEO-optimized ${contentType} content for the keyword "${mainKeyword}".

TARGET SPECIFICATIONS:
- Primary Keyword: ${mainKeyword}
- Content Type: ${contentType}
- User Intent: ${userIntent}
- Target Word Count: ${targetWordCount} words
- Focus: Outrank top competitors

COMPETITOR ANALYSIS:
${competitors.map((comp, i) => `
Competitor ${i + 1}: "${comp.title}"
- Key topics: ${comp.keyTopics.join(', ')}
- Estimated length: ${comp.wordCount} words
`).join('\n')}

SERP INSIGHTS TO LEVERAGE:
`;

    // Add SERP-specific insights
    if (serpData?.peopleAlsoAsk?.length > 0) {
      prompt += `\nPeople Also Ask Questions (MUST address these):
${serpData.peopleAlsoAsk.slice(0, 5).map((q, i) => `${i + 1}. ${q.question}`).join('\n')}
`;
    }

    if (serpData?.relatedSearches?.length > 0) {
      prompt += `\nRelated Searches to Include:
${serpData.relatedSearches.slice(0, 8).map(s => `- ${s.query}`).join('\n')}
`;
    }

    // Add entity requirements
    prompt += `\nENTITIES TO NATURALLY INCORPORATE:
${entityData.entities.slice(0, 10).join(', ')}

SEMANTIC KEYWORDS TO WEAVE IN:
${entityData.semanticKeywords.slice(0, 15).join(', ')}

CONTENT REQUIREMENTS:
1. Start with an engaging title that includes the main keyword
2. Create a meta description (150-160 characters)
3. Use H1, H2, H3 structure that matches SERP patterns
4. Answer all "People Also Ask" questions within the content
5. Include related searches as natural topic coverage
6. Incorporate entities and semantic keywords naturally
7. Create content that's MORE comprehensive than competitors
8. Ensure ${targetWordCount} word target (+/- 50 words)

FORMAT YOUR RESPONSE AS:
TITLE: [SEO-optimized title]
META_DESCRIPTION: [150-160 character meta description]
OUTLINE: [Bullet points of main sections]
CONTENT: [Full markdown content]
ENTITIES_USED: [List of entities incorporated]
SEMANTIC_KEYWORDS: [List of semantic keywords used]
`;

    return prompt;
  }

  private createSeoSystemPrompt(contentType: string, userIntent: string): string {
    return `You are an expert SEO content strategist specializing in creating content that ranks #1 on Google. Your content:

1. DOMINATES SERP COMPETITORS: Always creates more comprehensive, valuable content than existing top-rankers
2. PERFECT KEYWORD INTEGRATION: Naturally weaves keywords without stuffing
3. USER INTENT MASTERY: Perfectly matches ${userIntent} search intent
4. ENTITY OPTIMIZATION: Strategically incorporates relevant entities for semantic SEO
5. STRUCTURE EXCELLENCE: Uses proven heading structures from top-ranking content
6. COMPREHENSIVE COVERAGE: Addresses all related questions and subtopics

Content Type Focus: ${contentType}
- Use proven patterns and structures for this content type
- Optimize for both users and search engines
- Ensure content is genuinely helpful and actionable

Your goal: Create content so good that it deserves to rank #1.`;
  }

  private parseGeneratedContent(
    content: string,
    request: SeoContentRequest,
    entityData: any
  ): SeoContentResult {
    const lines = content.split('\n');
    let title = '';
    let metaDescription = '';
    let outline: string[] = [];
    let mainContent = '';
    let entitiesUsed: string[] = [];
    let semanticKeywords: string[] = [];

    let currentSection = '';
    
    for (const line of lines) {
      if (line.startsWith('TITLE:')) {
        title = line.replace('TITLE:', '').trim();
      } else if (line.startsWith('META_DESCRIPTION:')) {
        metaDescription = line.replace('META_DESCRIPTION:', '').trim();
      } else if (line.startsWith('OUTLINE:')) {
        currentSection = 'outline';
      } else if (line.startsWith('CONTENT:')) {
        currentSection = 'content';
      } else if (line.startsWith('ENTITIES_USED:')) {
        entitiesUsed = line.replace('ENTITIES_USED:', '').split(',').map(e => e.trim());
      } else if (line.startsWith('SEMANTIC_KEYWORDS:')) {
        semanticKeywords = line.replace('SEMANTIC_KEYWORDS:', '').split(',').map(k => k.trim());
      } else if (currentSection === 'outline' && line.trim().startsWith('-')) {
        outline.push(line.replace('-', '').trim());
      } else if (currentSection === 'content' && line.trim()) {
        mainContent += line + '\n';
      }
    }

    // Calculate content score based on various factors
    const contentScore = this.calculateContentScore(mainContent, request.mainKeyword, entitiesUsed);
    
    // Determine ranking potential
    const rankingPotential = this.assessRankingPotential(contentScore, mainContent.split(' ').length, request.targetWordCount);

    return {
      title: title || `Complete Guide to ${request.mainKeyword}`,
      metaDescription: metaDescription || `Learn everything about ${request.mainKeyword}. Comprehensive guide with expert insights and actionable tips.`,
      content: mainContent,
      outline,
      entities: entitiesUsed,
      semanticKeywords,
      contentScore,
      rankingPotential,
      suggestions: this.generateImprovementSuggestions(mainContent, request)
    };
  }

  private calculateContentScore(content: string, mainKeyword: string, entities: string[]): number {
    let score = 0;
    const words = content.toLowerCase().split(' ');
    
    // Keyword density (1-3% is optimal)
    const keywordCount = words.filter(word => word.includes(mainKeyword.toLowerCase())).length;
    const density = (keywordCount / words.length) * 100;
    if (density >= 1 && density <= 3) score += 25;
    else if (density >= 0.5) score += 15;
    
    // Entity coverage
    const entityScore = (entities.length / 10) * 25; // Up to 25 points for 10+ entities
    score += Math.min(25, entityScore);
    
    // Content length
    if (words.length >= 1500) score += 25;
    else if (words.length >= 1000) score += 15;
    
    // Structure (headings)
    const headingCount = (content.match(/^#+\s/gm) || []).length;
    if (headingCount >= 5) score += 25;
    else if (headingCount >= 3) score += 15;
    
    return Math.min(100, score);
  }

  private assessRankingPotential(score: number, wordCount: number, targetWordCount: number): 'high' | 'medium' | 'low' {
    const lengthMatch = Math.abs(wordCount - targetWordCount) / targetWordCount;
    
    if (score >= 80 && lengthMatch < 0.2) return 'high';
    if (score >= 60 && lengthMatch < 0.3) return 'medium';
    return 'low';
  }

  private generateImprovementSuggestions(content: string, request: SeoContentRequest): string[] {
    const suggestions: string[] = [];
    const words = content.split(' ');
    
    if (words.length < request.targetWordCount * 0.9) {
      suggestions.push(`Expand content to reach target of ${request.targetWordCount} words`);
    }
    
    const headingCount = (content.match(/^#+\s/gm) || []).length;
    if (headingCount < 4) {
      suggestions.push('Add more subheadings to improve content structure');
    }
    
    if (!content.includes('FAQ') && request.serpData?.peopleAlsoAsk?.length > 0) {
      suggestions.push('Consider adding an FAQ section based on People Also Ask questions');
    }
    
    return suggestions;
  }

  // Helper methods for entity and topic extraction
  private extractHeadings(text: string): string[] {
    // Simple heading extraction from snippet
    const sentences = text.split('.').filter(s => s.length > 10);
    return sentences.slice(0, 3);
  }

  private extractEntitiesFromText(text: string): string[] {
    // Simple entity extraction (in production, use NLP library)
    const words = text.split(' ');
    const entities = words.filter(word => 
      word.length > 4 && 
      /^[A-Z]/.test(word) && 
      !['This', 'That', 'The', 'And', 'But', 'For', 'With'].includes(word)
    );
    return [...new Set(entities)].slice(0, 5);
  }

  private extractKeyTopics(text: string): string[] {
    // Extract key topics from text
    const sentences = text.split('.').filter(s => s.length > 20);
    return sentences.slice(0, 3);
  }

  private extractEntitiesFromSerp(serpData: SerpAnalysisResult): string[] {
    const entities: string[] = [];
    
    if (serpData?.entities) {
      entities.push(...serpData.entities.map(e => e.name));
    }
    
    if (serpData?.peopleAlsoAsk) {
      serpData.peopleAlsoAsk.forEach(q => {
        const words = q.question.split(' ').filter(w => w.length > 4);
        entities.push(...words);
      });
    }
    
    return [...new Set(entities)].slice(0, 10);
  }

  private async generateSemanticKeywords(mainKeyword: string): Promise<string[]> {
    // Generate semantic keywords (in production, use semantic analysis API)
    const baseKeywords = [
      `${mainKeyword} guide`,
      `${mainKeyword} tips`,
      `${mainKeyword} best practices`,
      `${mainKeyword} examples`,
      `${mainKeyword} benefits`,
      `${mainKeyword} features`,
      `${mainKeyword} comparison`,
      `${mainKeyword} review`,
      `how to ${mainKeyword}`,
      `${mainKeyword} tutorial`
    ];
    
    return baseKeywords.slice(0, 8);
  }

  private createFallbackContent(request: SeoContentRequest): SeoContentResult {
    return {
      title: `Complete Guide to ${request.mainKeyword}`,
      metaDescription: `Learn everything about ${request.mainKeyword}. Expert insights and actionable tips.`,
      content: `# Complete Guide to ${request.mainKeyword}\n\nThis comprehensive guide covers everything you need to know about ${request.mainKeyword}.`,
      outline: ['Introduction', 'Key Concepts', 'Best Practices', 'Conclusion'],
      entities: [],
      semanticKeywords: [],
      contentScore: 50,
      rankingPotential: 'medium',
      suggestions: ['Content needs expansion', 'Add more detailed sections']
    };
  }
}

export const advancedSeoContentGenerator = new AdvancedSeoContentGenerator();
