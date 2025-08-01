
import { sendChatRequest } from './aiService';
import { toast } from 'sonner';

export interface SeoAnalysisResult {
  score: number;
  readability: number;
  keywordDensity: number;
  structure: number;
  recommendations: string[];
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    fix?: string;
  }>;
}

export class SeoAnalysisService {
  async analyzeContent(content: string, targetKeyword?: string): Promise<SeoAnalysisResult> {
    if (!content || content.length < 100) {
      throw new Error('Content must be at least 100 characters long');
    }

    try {
      // Calculate basic metrics
      const wordCount = content.split(/\s+/).length;
      const sentenceCount = content.split(/[.!?]+/).length;
      const avgWordsPerSentence = wordCount / sentenceCount;
      
      // Readability score (simplified Flesch Reading Ease)
      const avgSentenceLength = avgWordsPerSentence;
      const syllableCount = this.countSyllables(content);
      const avgSyllablesPerWord = syllableCount / wordCount;
      const readability = Math.max(0, Math.min(100, 
        206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
      ));

      // Keyword density analysis
      const keywordDensity = targetKeyword ? 
        this.calculateKeywordDensity(content, targetKeyword) : 0;

      // Structure analysis
      const structure = this.analyzeStructure(content);

      // Generate AI-powered recommendations
      const recommendations = await this.generateRecommendations(content, {
        wordCount,
        readability,
        keywordDensity,
        structure,
        targetKeyword
      });

      // Calculate overall score
      const score = Math.round(
        (readability * 0.3) + 
        (structure * 0.3) + 
        (keywordDensity > 0 ? Math.min(keywordDensity * 20, 100) * 0.2 : 50) +
        (wordCount > 300 ? 100 * 0.2 : (wordCount / 300) * 100 * 0.2)
      );

      return {
        score: Math.min(100, Math.max(0, score)),
        readability: Math.round(readability),
        keywordDensity: Math.round(keywordDensity * 100) / 100,
        structure: Math.round(structure),
        recommendations,
        issues: this.identifyIssues(content, { wordCount, readability, keywordDensity, structure })
      };
    } catch (error) {
      console.error('SEO analysis error:', error);
      toast.error('Failed to analyze content');
      throw error;
    }
  }

  private countSyllables(text: string): number {
    return text.toLowerCase()
      .replace(/[^a-z]/g, ' ')
      .split(' ')
      .filter(word => word.length > 0)
      .reduce((count, word) => {
        const syllables = word.match(/[aeiouy]+/g);
        return count + (syllables ? syllables.length : 1);
      }, 0);
  }

  private calculateKeywordDensity(content: string, keyword: string): number {
    const words = content.toLowerCase().split(/\s+/);
    const keywordOccurrences = words.filter(word => 
      word.includes(keyword.toLowerCase())).length;
    return (keywordOccurrences / words.length) * 100;
  }

  private analyzeStructure(content: string): number {
    let score = 0;
    
    // Check for headings
    const headingMatches = content.match(/^#{1,6}\s/gm);
    if (headingMatches && headingMatches.length > 0) score += 25;
    
    // Check for lists
    const listMatches = content.match(/^[-*]\s/gm);
    if (listMatches && listMatches.length > 0) score += 25;
    
    // Check for paragraphs (double line breaks)
    const paragraphs = content.split(/\n\s*\n/);
    if (paragraphs.length > 2) score += 25;
    
    // Check content length
    if (content.length > 1000) score += 25;
    
    return score;
  }

  private async generateRecommendations(content: string, metrics: any): Promise<string[]> {
    try {
      const response = await sendChatRequest('openai', {
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert. Provide 3-5 specific, actionable recommendations to improve content SEO based on the analysis.'
          },
          {
            role: 'user',
            content: `Analyze this content and provide SEO recommendations:

Content: ${content.substring(0, 1000)}...

Metrics:
- Word count: ${metrics.wordCount}
- Readability score: ${metrics.readability}
- Keyword density: ${metrics.keywordDensity}%
- Structure score: ${metrics.structure}
- Target keyword: ${metrics.targetKeyword || 'Not specified'}

Provide specific, actionable recommendations.`
          }
        ]
      });

      if (response?.choices?.[0]?.message?.content) {
        return response.choices[0].message.content
          .split('\n')
          .filter(line => line.trim().length > 0)
          .slice(0, 5);
      }
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
    }

    // Fallback recommendations
    return [
      'Improve content structure with clear headings and subheadings',
      'Optimize keyword density to 1-2% of total word count',
      'Add bullet points or numbered lists for better readability',
      'Ensure content length is at least 300 words for better SEO',
      'Include relevant internal and external links'
    ];
  }

  private identifyIssues(content: string, metrics: any) {
    const issues = [];

    if (metrics.wordCount < 300) {
      issues.push({
        type: 'error' as const,
        message: 'Content is too short. Aim for at least 300 words.',
        fix: 'Add more detailed information and examples'
      });
    }

    if (metrics.readability < 30) {
      issues.push({
        type: 'warning' as const,
        message: 'Content is difficult to read. Consider simplifying language.',
        fix: 'Use shorter sentences and common vocabulary'
      });
    }

    if (metrics.keywordDensity > 3) {
      issues.push({
        type: 'warning' as const,
        message: 'Keyword density is too high (keyword stuffing risk)',
        fix: 'Reduce keyword repetition and use synonyms'
      });
    }

    if (metrics.structure < 50) {
      issues.push({
        type: 'suggestion' as const,
        message: 'Improve content structure with headings and lists',
        fix: 'Add H2/H3 headings and bullet points'
      });
    }

    return issues;
  }

  async applyRecommendation(content: string, recommendation: string): Promise<string> {
    try {
      const response = await sendChatRequest('openai', {
        messages: [
          {
            role: 'system',
            content: 'You are an expert content optimizer. Apply the specific recommendation to improve the content while maintaining its core message and structure.'
          },
          {
            role: 'user',
            content: `Apply this recommendation to the content:

Recommendation: ${recommendation}

Content:
${content}

Return only the improved content.`
          }
        ]
      });

      if (response?.choices?.[0]?.message?.content) {
        return response.choices[0].message.content;
      }
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
      toast.error('Failed to apply recommendation');
    }

    return content;
  }
}

export const seoAnalysisService = new SeoAnalysisService();
