/**
 * Comprehensive SERP Analysis Service
 * Provides detailed insights and content gap analysis
 */

import { SerpAnalysisResult } from '@/types/serp';

export interface ComprehensiveSerpInsights {
  keyword: string;
  location?: string;
  searchVolume?: number;
  keywordDifficulty?: number;
  cpc?: number;
  competitorAnalysis: {
    topCompetitors: Array<{
      domain: string;
      title: string;
      position: number;
      snippet: string;
      headings?: string[];
      wordCount?: number;
    }>;
    averageWordCount: number;
    commonHeadings: string[];
    missingTopics: string[];
  };
  contentGaps: Array<{
    topic: string;
    description: string;
    opportunity: 'high' | 'medium' | 'low';
    recommendedSection: string;
    source: string;
  }>;
  faqOpportunities: Array<{
    question: string;
    answer?: string;
    source: string;
    isAnswered: boolean;
  }>;
  headingStructure: {
    suggestedH1: string[];
    suggestedH2: string[];
    suggestedH3: string[];
  };
  contentOutline: {
    title: string;
    introduction: string;
    sections: Array<{
      heading: string;
      level: 'h2' | 'h3';
      content: string;
      keywords: string[];
    }>;
    faqSection: Array<{
      question: string;
      answer: string;
    }>;
    conclusion: string;
  };
  seoRecommendations: Array<{
    type: 'content' | 'technical' | 'user-experience';
    priority: 'high' | 'medium' | 'low';
    recommendation: string;
    implementation: string;
  }>;
}

export class ComprehensiveSerpAnalyzer {
  
  static async analyzeComprehensively(
    serpData: SerpAnalysisResult, 
    location?: string
  ): Promise<ComprehensiveSerpInsights> {
    
    const competitorAnalysis = this.analyzeCompetitors(serpData);
    const contentGaps = this.identifyContentGaps(serpData, competitorAnalysis);
    const faqOpportunities = this.analyzeFaqOpportunities(serpData);
    const headingStructure = this.generateHeadingStructure(serpData, competitorAnalysis);
    const contentOutline = this.generateContentOutline(serpData, contentGaps, faqOpportunities);
    const seoRecommendations = this.generateSeoRecommendations(serpData, competitorAnalysis);

    return {
      keyword: serpData.keyword,
      location,
      searchVolume: serpData.searchVolume,
      keywordDifficulty: serpData.keywordDifficulty,
      cpc: (serpData as any).cpc,
      competitorAnalysis,
      contentGaps,
      faqOpportunities,
      headingStructure,
      contentOutline,
      seoRecommendations
    };
  }

  private static analyzeCompetitors(serpData: SerpAnalysisResult) {
    const topCompetitors = serpData.topResults.slice(0, 5).map((result, index) => ({
      domain: this.extractDomain(result.link),
      title: result.title,
      position: result.position || index + 1,
      snippet: result.snippet,
      headings: serpData.headings?.filter(h => (h as any).source === result.link).map(h => h.text) || [],
      wordCount: this.estimateWordCount(result.snippet)
    }));

    const allHeadings = serpData.headings?.map(h => h.text) || [];
    const headingFrequency = this.calculateHeadingFrequency(allHeadings);
    const commonHeadings = Object.entries(headingFrequency)
      .filter(([_, count]) => count >= 2)
      .map(([heading]) => heading)
      .slice(0, 10);

    const averageWordCount = topCompetitors.reduce((sum, comp) => sum + (comp.wordCount || 0), 0) / topCompetitors.length;

    const missingTopics = this.identifyMissingTopics(serpData, topCompetitors);

    return {
      topCompetitors,
      averageWordCount: Math.round(averageWordCount),
      commonHeadings,
      missingTopics
    };
  }

  private static identifyContentGaps(serpData: SerpAnalysisResult, competitorAnalysis: any) {
    const gaps: any[] = [];

    // Analyze PAA questions not covered by top results
    serpData.peopleAlsoAsk?.forEach(paa => {
      const isCovered = competitorAnalysis.topCompetitors.some(comp => 
        comp.snippet.toLowerCase().includes(paa.question.toLowerCase()) ||
        comp.headings?.some(h => h.toLowerCase().includes(paa.question.toLowerCase()))
      );

      if (!isCovered) {
        gaps.push({
          topic: paa.question,
          description: `Answer the question: "${paa.question}"`,
          opportunity: 'high',
          recommendedSection: `Create a dedicated section answering: ${paa.question}`,
          source: 'People Also Ask'
        });
      }
    });

    // Identify related searches not covered
    serpData.relatedSearches?.forEach(related => {
      const isCovered = competitorAnalysis.topCompetitors.some(comp =>
        comp.title.toLowerCase().includes(related.query.toLowerCase()) ||
        comp.snippet.toLowerCase().includes(related.query.toLowerCase())
      );

      if (!isCovered) {
        gaps.push({
          topic: related.query,
          description: `Address the search intent: "${related.query}"`,
          opportunity: 'medium',
          recommendedSection: `Add subsection covering: ${related.query}`,
          source: 'Related Searches'
        });
      }
    });

    return gaps.slice(0, 8); // Limit to top 8 opportunities
  }

  private static analyzeFaqOpportunities(serpData: SerpAnalysisResult) {
    const faqOpportunities: any[] = [];

    // Convert PAA to FAQ opportunities
    serpData.peopleAlsoAsk?.forEach(paa => {
      faqOpportunities.push({
        question: paa.question,
        answer: paa.answer || '',
        source: paa.source || 'People Also Ask',
        isAnswered: !!paa.answer
      });
    });

    // Add questions from content gaps
    serpData.contentGaps?.forEach(gap => {
      if (gap.topic.includes('?')) {
        faqOpportunities.push({
          question: gap.topic,
          answer: gap.content || '',
          source: 'Content Analysis',
          isAnswered: !!gap.content
        });
      }
    });

    return faqOpportunities.slice(0, 10);
  }

  private static generateHeadingStructure(serpData: SerpAnalysisResult, competitorAnalysis: any) {
    const keyword = serpData.keyword;
    
    const suggestedH1 = [
      `The Complete Guide to ${this.capitalizeWords(keyword)} in 2024`,
      `${this.capitalizeWords(keyword)}: Everything You Need to Know`,
      `Best ${this.capitalizeWords(keyword)} Solutions and Strategies`
    ];

    const suggestedH2 = [
      `What is ${this.capitalizeWords(keyword)}?`,
      `How to Choose the Best ${this.capitalizeWords(keyword)}`,
      `${this.capitalizeWords(keyword)} Best Practices`,
      `Common ${this.capitalizeWords(keyword)} Mistakes to Avoid`,
      `Frequently Asked Questions`,
      ...competitorAnalysis.commonHeadings.slice(0, 3)
    ];

    const suggestedH3 = serpData.peopleAlsoAsk?.slice(0, 6).map(paa => paa.question) || [];

    return {
      suggestedH1,
      suggestedH2: [...new Set(suggestedH2)].slice(0, 8),
      suggestedH3: [...new Set(suggestedH3)].slice(0, 8)
    };
  }

  private static generateContentOutline(serpData: SerpAnalysisResult, contentGaps: any[], faqOpportunities: any[]) {
    const keyword = serpData.keyword;
    
    const outline = {
      title: `The Ultimate Guide to ${this.capitalizeWords(keyword)} - 2024 Edition`,
      introduction: `Learn everything you need to know about ${keyword}. This comprehensive guide covers best practices, expert tips, and answers to the most common questions.`,
      sections: [
        {
          heading: `What is ${this.capitalizeWords(keyword)}?`,
          level: 'h2' as const,
          content: `Define ${keyword} and explain its importance`,
          keywords: [keyword, `${keyword} definition`, `${keyword} meaning`]
        },
        {
          heading: `How to Get Started with ${this.capitalizeWords(keyword)}`,
          level: 'h2' as const,
          content: `Step-by-step guide for beginners`,
          keywords: [`${keyword} guide`, `${keyword} tutorial`, `${keyword} for beginners`]
        }
      ],
      faqSection: faqOpportunities.slice(0, 8).map(faq => ({
        question: faq.question,
        answer: faq.answer || `Provide a comprehensive answer to: ${faq.question}`
      })),
      conclusion: `Summary of key points and next steps for ${keyword}`
    };

    // Add content gap sections
    contentGaps.slice(0, 5).forEach(gap => {
      outline.sections.push({
        heading: gap.topic.includes('?') ? gap.topic : `Understanding ${gap.topic}`,
        level: 'h2' as const,
        content: gap.description,
        keywords: [gap.topic, keyword]
      });
    });

    return outline;
  }

  private static generateSeoRecommendations(serpData: SerpAnalysisResult, competitorAnalysis: any) {
    const recommendations: any[] = [
      {
        type: 'content',
        priority: 'high',
        recommendation: `Target word count: ${competitorAnalysis.averageWordCount + 200}-${competitorAnalysis.averageWordCount + 500} words`,
        implementation: `Write comprehensive content that exceeds competitor average of ${competitorAnalysis.averageWordCount} words`
      },
      {
        type: 'content',
        priority: 'high',
        recommendation: 'Include FAQ section based on People Also Ask data',
        implementation: `Add ${serpData.peopleAlsoAsk?.length || 0} questions from PAA analysis`
      },
      {
        type: 'technical',
        priority: 'medium',
        recommendation: 'Optimize for featured snippets',
        implementation: 'Structure content with clear, concise answers that could be featured'
      },
      {
        type: 'user-experience',
        priority: 'medium',
        recommendation: 'Use clear heading hierarchy',
        implementation: 'Implement H1 > H2 > H3 structure based on competitor analysis'
      }
    ];

    if (serpData.searchVolume && serpData.searchVolume > 1000) {
      recommendations.push({
        type: 'content',
        priority: 'high',
        recommendation: 'Target high-volume keyword variations',
        implementation: `Include related searches: ${serpData.relatedSearches?.slice(0, 3).map(r => r.query).join(', ')}`
      });
    }

    return recommendations;
  }

  // Helper methods
  private static extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  private static estimateWordCount(text: string): number {
    return text.split(' ').length * 8; // Estimate based on snippet
  }

  private static calculateHeadingFrequency(headings: string[]): Record<string, number> {
    return headings.reduce((freq, heading) => {
      freq[heading] = (freq[heading] || 0) + 1;
      return freq;
    }, {} as Record<string, number>);
  }

  private static identifyMissingTopics(serpData: SerpAnalysisResult, competitors: any[]): string[] {
    const allTopics = new Set<string>();
    
    // Add topics from related searches
    serpData.relatedSearches?.forEach(search => allTopics.add(search.query));
    
    // Add topics from PAA
    serpData.peopleAlsoAsk?.forEach(paa => allTopics.add(paa.question));
    
    // Filter out topics already covered by competitors
    const coveredTopics = new Set<string>();
    competitors.forEach(comp => {
      comp.headings?.forEach((heading: string) => coveredTopics.add(heading.toLowerCase()));
    });
    
    return Array.from(allTopics).filter(topic => 
      !Array.from(coveredTopics).some(covered => 
        covered.includes(topic.toLowerCase()) || topic.toLowerCase().includes(covered)
      )
    ).slice(0, 5);
  }

  private static capitalizeWords(str: string): string {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
}