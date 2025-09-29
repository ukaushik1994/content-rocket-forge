import { supabase } from '@/integrations/supabase/client';
import AIServiceController from '@/services/aiService/AIServiceController';

export interface ContentAnalysisResult {
  seoScore: number;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  recommendations: ContentRecommendation[];
  titleSuggestions: TitleSuggestion[];
  metaDescriptionSuggestions: string[];
  headingStructure: HeadingAnalysis;
  internalLinkingOpportunities: LinkingOpportunity[];
}

export interface ContentRecommendation {
  id: string;
  type: 'seo' | 'readability' | 'structure' | 'keyword' | 'linking';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  actionable: boolean;
}

export interface TitleSuggestion {
  title: string;
  seoScore: number;
  estimatedCTR: number;
  reasoning: string;
}

export interface HeadingAnalysis {
  structure: Array<{ level: number; text: string; issues: string[] }>;
  recommendations: string[];
  missingKeywords: string[];
}

export interface LinkingOpportunity {
  anchorText: string;
  targetUrl: string;
  relevanceScore: number;
  contextSnippet: string;
}

export interface ReadabilityMetrics {
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  averageSentenceLength: number;
  averageWordLength: number;
  complexWordPercentage: number;
  recommendations: string[];
}

class ContentIntelligenceService {
  /**
   * Comprehensive content analysis with AI-powered insights
   */
  async analyzeContent(
    content: string,
    title: string,
    keywords: string[],
    contentType: string = 'blog'
  ): Promise<ContentAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(content, title, keywords, contentType);
    
    try {
      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'content_generation',
        temperature: 0.3,
      });

      const analysis = this.parseAnalysisResponse(response);
      return analysis;
    } catch (error) {
      console.error('Content intelligence analysis failed:', error);
      throw error;
    }
  }

  /**
   * Calculate readability metrics (Flesch-Kincaid, etc.)
   */
  calculateReadability(content: string): ReadabilityMetrics {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
    
    const complexWords = words.filter(w => this.countSyllables(w) > 2).length;
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    
    // Flesch Reading Ease: 206.835 - 1.015(total words/total sentences) - 84.6(total syllables/total words)
    const fleschReadingEase = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    // Flesch-Kincaid Grade Level: 0.39(total words/total sentences) + 11.8(total syllables/total words) - 15.59
    const fleschKincaidGrade = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;
    
    const complexWordPercentage = (complexWords / words.length) * 100;

    const recommendations: string[] = [];
    if (fleschReadingEase < 60) {
      recommendations.push('Content is difficult to read. Consider shorter sentences and simpler words.');
    }
    if (avgSentenceLength > 20) {
      recommendations.push('Average sentence length is too long. Aim for 15-20 words per sentence.');
    }
    if (complexWordPercentage > 15) {
      recommendations.push('Too many complex words. Simplify vocabulary for better readability.');
    }
    if (fleschKincaidGrade > 12) {
      recommendations.push('Content requires college-level reading. Consider simplifying for broader audience.');
    }

    return {
      fleschKincaidGrade: Math.max(0, fleschKincaidGrade),
      fleschReadingEase: Math.max(0, Math.min(100, fleschReadingEase)),
      averageSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      averageWordLength: Math.round(avgWordLength * 10) / 10,
      complexWordPercentage: Math.round(complexWordPercentage * 10) / 10,
      recommendations,
    };
  }

  /**
   * Calculate keyword density and distribution
   */
  calculateKeywordDensity(content: string, keywords: string[]): Record<string, number> {
    const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;
    const density: Record<string, number> = {};

    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const occurrences = content.toLowerCase().split(keywordLower).length - 1;
      density[keyword] = (occurrences / totalWords) * 100;
    });

    return density;
  }

  /**
   * Generate title suggestions with SEO scoring
   */
  async generateTitleSuggestions(
    content: string,
    currentTitle: string,
    keywords: string[]
  ): Promise<TitleSuggestion[]> {
    const prompt = `
Analyze this content and current title, then generate 5 alternative title suggestions optimized for SEO and CTR.

Current Title: ${currentTitle}
Target Keywords: ${keywords.join(', ')}
Content Preview: ${content.substring(0, 500)}...

For each title suggestion, provide:
1. The title (50-60 characters)
2. SEO score (0-100)
3. Estimated CTR percentage
4. Brief reasoning

Return ONLY a JSON array with this structure:
[
  {
    "title": "string",
    "seoScore": number,
    "estimatedCTR": number,
    "reasoning": "string"
  }
]
    `.trim();

    try {
      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'title_generation',
        temperature: 0.7,
      });

      const suggestions = this.extractJson(response) as TitleSuggestion[];
      return suggestions || [];
    } catch (error) {
      console.error('Title generation failed:', error);
      return [];
    }
  }

  /**
   * Generate meta description suggestions
   */
  async generateMetaDescriptions(
    content: string,
    title: string,
    keywords: string[]
  ): Promise<string[]> {
    const prompt = `
Generate 3 compelling meta descriptions for this content (150-160 characters each).

Title: ${title}
Keywords: ${keywords.join(', ')}
Content: ${content.substring(0, 500)}...

Requirements:
- Include primary keyword naturally
- Action-oriented and compelling
- Accurately summarize content value
- Optimized for click-through rate

Return ONLY a JSON array of strings: ["description1", "description2", "description3"]
    `.trim();

    try {
      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'content_generation',
        temperature: 0.7,
      });

      const descriptions = this.extractJson(response) as string[];
      return descriptions || [];
    } catch (error) {
      console.error('Meta description generation failed:', error);
      return [];
    }
  }

  /**
   * Analyze heading structure and provide optimization recommendations
   */
  analyzeHeadingStructure(content: string, keywords: string[]): HeadingAnalysis {
    const headingRegex = /<h([1-6])>(.*?)<\/h\1>/gi;
    const headings: Array<{ level: number; text: string; issues: string[] }> = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      const text = match[2].replace(/<[^>]*>/g, '').trim();
      const issues: string[] = [];

      if (text.length < 20) issues.push('Too short - aim for 20-70 characters');
      if (text.length > 70) issues.push('Too long - keep under 70 characters');
      
      const hasKeyword = keywords.some(kw => text.toLowerCase().includes(kw.toLowerCase()));
      if (!hasKeyword && level <= 3) {
        issues.push('Consider including a target keyword');
      }

      headings.push({ level, text, issues });
    }

    const recommendations: string[] = [];
    const missingKeywords: string[] = [];

    if (headings.length === 0) {
      recommendations.push('Add heading structure (H1, H2, H3) for better SEO');
    }

    const h1Count = headings.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      recommendations.push('Add exactly one H1 heading');
    } else if (h1Count > 1) {
      recommendations.push('Use only one H1 heading per page');
    }

    keywords.forEach(keyword => {
      const usedInHeadings = headings.some(h => 
        h.text.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!usedInHeadings) {
        missingKeywords.push(keyword);
      }
    });

    if (missingKeywords.length > 0) {
      recommendations.push(`Include these keywords in headings: ${missingKeywords.join(', ')}`);
    }

    return {
      structure: headings,
      recommendations,
      missingKeywords,
    };
  }

  /**
   * Find internal linking opportunities based on existing content
   */
  async findInternalLinkingOpportunities(
    content: string,
    currentUrl: string
  ): Promise<LinkingOpportunity[]> {
    try {
      // Fetch user's published content
      const { data: publishedContent } = await supabase
        .from('content_items')
        .select('id, title, published_url, keywords, content')
        .eq('status', 'published')
        .neq('published_url', currentUrl)
        .limit(50);

      if (!publishedContent || publishedContent.length === 0) {
        return [];
      }

      const prompt = `
Analyze this content and suggest internal linking opportunities from the available pages.

Current Content: ${content.substring(0, 1000)}...

Available Pages:
${publishedContent.map((item, idx) => {
  const keywords = Array.isArray(item.keywords) ? item.keywords[0] : '';
  return `${idx + 1}. ${item.title} (${keywords}) - ${item.published_url}`;
}).join('\n')}

Find 3-5 natural linking opportunities where the current content could link to these pages.

Return ONLY a JSON array:
[
  {
    "anchorText": "suggested anchor text",
    "targetUrl": "exact URL from available pages",
    "relevanceScore": 0-100,
    "contextSnippet": "sentence where link should be placed"
  }
]
      `.trim();

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'content_generation',
        temperature: 0.5,
      });

      const opportunities = this.extractJson(response) as LinkingOpportunity[];
      return opportunities || [];
    } catch (error) {
      console.error('Internal linking analysis failed:', error);
      return [];
    }
  }

  private buildAnalysisPrompt(
    content: string,
    title: string,
    keywords: string[],
    contentType: string
  ): string {
    return `
Perform comprehensive SEO and content analysis on this ${contentType} content.

Title: ${title}
Keywords: ${keywords.join(', ')}
Content: ${content.substring(0, 2000)}...

Analyze and provide:
1. Overall SEO score (0-100)
2. Readability assessment
3. Keyword optimization status
4. Top 5 actionable recommendations (prioritized by impact)

Return ONLY valid JSON with this structure:
{
  "seoScore": number,
  "readabilityScore": number,
  "recommendations": [
    {
      "id": "unique-id",
      "type": "seo|readability|structure|keyword|linking",
      "priority": "high|medium|low",
      "title": "string",
      "description": "string",
      "impact": "string",
      "actionable": boolean
    }
  ]
}
    `.trim();
  }

  private parseAnalysisResponse(response: string): ContentAnalysisResult {
    const data = this.extractJson(response);
    
    return {
      seoScore: data?.seoScore || 50,
      readabilityScore: data?.readabilityScore || 50,
      keywordDensity: {},
      recommendations: data?.recommendations || [],
      titleSuggestions: [],
      metaDescriptionSuggestions: [],
      headingStructure: { structure: [], recommendations: [], missingKeywords: [] },
      internalLinkingOpportunities: [],
    };
  }

  private extractJson(text: string): Record<string, any> | null {
    try {
      // Try to find JSON in code blocks
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]) as Record<string, any>;
      }
      
      // Try to parse the entire response
      return JSON.parse(text) as Record<string, any>;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return null;
    }
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }
    
    // Adjust for silent 'e'
    if (word.endsWith('e')) {
      syllableCount--;
    }
    
    return Math.max(1, syllableCount);
  }
}

export const contentIntelligenceService = new ContentIntelligenceService();
