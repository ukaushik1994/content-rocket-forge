
import { BaseAdapter } from './BaseAdapter';
import { SerpApiOptions } from '../core/SerpCore';
import { SerpAnalysisResult, Heading } from '@/types/serp';

/**
 * Mock adapter for SERP data
 */
export class MockAdapter extends BaseAdapter {
  provider = 'mock';

  constructor() {
    super();
  }

  /**
   * Test if mock API key is valid
   * For mock adapter, this is always true
   */
  async testApiKey(): Promise<boolean> {
    return true;
  }

  /**
   * Analyze a keyword and return mock SERP data
   */
  async analyzeKeyword(options: SerpApiOptions): Promise<SerpAnalysisResult> {
    const { keyword } = options;
    
    // Simple delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      provider: 'mock',
      keyword,
      searchVolume: Math.floor(Math.random() * 10000) + 1000,
      keywords: this.generateMockKeywords(keyword, 10),
      peopleAlsoAsk: this.generateMockQuestions(keyword, 5),
      headings: this.generateMockHeadings(keyword, 8),
      relatedSearches: this.generateMockRelatedSearches(keyword, 6),
      entities: this.generateMockEntities(keyword, 4),
      topResults: this.generateMockResults(keyword, 10),
      featuredSnippets: this.generateMockFeaturedSnippets(keyword, 2),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Search for keywords with mock data
   */
  async searchKeywords(options: SerpApiOptions): Promise<any[]> {
    const { keyword, limit = 10 } = options;
    
    // Simple delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return this.generateMockKeywords(keyword, limit);
  }

  /**
   * Search for related keywords with mock data
   */
  async searchRelatedKeywords(options: SerpApiOptions): Promise<any[]> {
    const { keyword, limit = 20 } = options;
    
    // Simple delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return this.generateMockRelatedSearches(keyword, limit);
  }

  /**
   * Generate mock keywords
   */
  private generateMockKeywords(keyword: string, count: number): any[] {
    const prefixes = ['best', 'top', 'how to', 'what is', 'why', 'when to'];
    const suffixes = ['guide', 'tutorial', 'tips', 'examples', 'solutions', 'benefits'];
    
    return Array.from({ length: count }, (_, i) => {
      const prefix = i % 2 === 0 ? prefixes[i % prefixes.length] + ' ' : '';
      const suffix = i % 3 === 0 ? ' ' + suffixes[i % suffixes.length] : '';
      const volume = Math.floor(Math.random() * 5000) + 500;
      
      return {
        keyword: `${prefix}${keyword}${suffix}`,
        searchVolume: volume,
        difficulty: Math.floor(Math.random() * 100),
        cpc: (Math.random() * 5).toFixed(2)
      };
    });
  }

  /**
   * Generate mock questions
   */
  private generateMockQuestions(keyword: string, count: number): string[] {
    const questions = [
      `What is ${keyword}?`,
      `How does ${keyword} work?`,
      `Why is ${keyword} important?`,
      `When should you use ${keyword}?`,
      `Where can I learn about ${keyword}?`,
      `How to optimize ${keyword}?`,
      `What are the benefits of ${keyword}?`,
      `What are the disadvantages of ${keyword}?`,
      `How much does ${keyword} cost?`,
      `Is ${keyword} worth it?`
    ];
    
    return questions.slice(0, count);
  }

  /**
   * Generate mock headings - Updated to return Heading[] instead of string[]
   */
  private generateMockHeadings(keyword: string, count: number): Heading[] {
    const headingsText = [
      `Introduction to ${keyword}`,
      `What is ${keyword}?`,
      `Benefits of ${keyword}`,
      `How to Use ${keyword}`,
      `${keyword} Best Practices`,
      `${keyword} Case Studies`,
      `Common Mistakes to Avoid with ${keyword}`,
      `Future of ${keyword}`,
      `${keyword} Tools and Resources`,
      `${keyword} Alternatives`,
      `${keyword} Pricing and Cost`,
      `Frequently Asked Questions about ${keyword}`
    ];
    
    // Convert string[] to Heading[] with appropriate level and text
    return headingsText.slice(0, count).map((text, index) => ({
      text,
      level: index === 0 ? "h1" : (index < 3 ? "h2" : "h3")
    }));
  }

  /**
   * Generate mock related searches
   */
  private generateMockRelatedSearches(keyword: string, count: number): any[] {
    const related = [
      `${keyword} tutorial`,
      `${keyword} examples`,
      `${keyword} alternatives`,
      `${keyword} vs competition`,
      `how to learn ${keyword}`,
      `best ${keyword} tools`,
      `${keyword} for beginners`,
      `advanced ${keyword} techniques`,
      `${keyword} certification`,
      `${keyword} jobs`,
      `${keyword} salary`,
      `${keyword} course`
    ];
    
    return related.slice(0, count).map(query => ({
      query,
      searchVolume: Math.floor(Math.random() * 3000) + 300
    }));
  }

  /**
   * Generate mock entities
   */
  private generateMockEntities(keyword: string, count: number): string[] {
    // Create mock entities based on the keyword
    const entities = [
      `${keyword} Platform`,
      `${keyword} Framework`,
      `${keyword} Tool`,
      `${keyword} Community`,
      `${keyword} Institute`,
      `${keyword} Conference`,
      `${keyword} Expert`,
      `${keyword} Foundation`
    ];
    
    return entities.slice(0, count);
  }

  /**
   * Generate mock top results
   */
  private generateMockResults(keyword: string, count: number): any[] {
    return Array.from({ length: count }, (_, i) => ({
      title: `${i+1}. Complete Guide to ${keyword} in ${new Date().getFullYear()}`,
      url: `https://example${i}.com/${keyword.toLowerCase().replace(/\s+/g, '-')}`,
      description: `Learn everything you need to know about ${keyword} including best practices, expert tips, and common mistakes to avoid.`,
      position: i + 1
    }));
  }

  /**
   * Generate mock featured snippets
   */
  private generateMockFeaturedSnippets(keyword: string, count: number): any[] {
    const snippetTypes = ['paragraph', 'list', 'table'];
    
    return Array.from({ length: count }, (_, i) => ({
      type: snippetTypes[i % snippetTypes.length],
      title: `Quick Answer: ${keyword} Explained`,
      content: `${keyword} is a powerful technique used by professionals to improve performance and get better results. It works by systematically analyzing data and implementing strategic improvements.`,
      sourceUrl: `https://snippet${i}.com/${keyword.toLowerCase().replace(/\s+/g, '-')}`
    }));
  }

  /**
   * Implementation of required BaseAdapter methods
   */
  async fetchAnalysis(keyword: string): Promise<SerpAnalysisResult> {
    return this.analyzeKeyword({ keyword });
  }

  async fetchKeywords(keyword: string, limit?: number): Promise<any[]> {
    return this.searchKeywords({ keyword, limit });
  }

  async fetchRelatedKeywords(keyword: string, limit?: number): Promise<any[]> {
    return this.searchRelatedKeywords({ keyword, limit });
  }

  getProviderName(): string {
    return 'Mock Data';
  }
}
