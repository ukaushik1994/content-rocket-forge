
import { BaseAdapter } from './BaseAdapter';
import { SerpApiOptions } from '../core/SerpCore';
import { SerpAnalysisResult } from '@/types/serp';
import { generateMockSerpData, getMockKeywordResults } from '../mockData';

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
    
    // Use the existing mock data generator
    return generateMockSerpData(keyword);
  }

  /**
   * Search for keywords with mock data
   */
  async searchKeywords(options: SerpApiOptions): Promise<any[]> {
    const { keyword, limit = 10 } = options;
    
    // Simple delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Use the existing mock keyword results generator
    return getMockKeywordResults(keyword).slice(0, limit);
  }

  /**
   * Search for related keywords with mock data
   */
  async searchRelatedKeywords(options: SerpApiOptions): Promise<any[]> {
    const { keyword, limit = 20 } = options;
    
    // Simple delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Use the existing mock keyword results and modify slightly for related keywords
    return getMockKeywordResults(keyword)
      .map(item => ({
        ...item, 
        keyword: item.keyword.includes(keyword) ? item.keyword : `${keyword} ${item.keyword}`
      }))
      .slice(0, limit);
  }

  getProviderName(): string {
    return 'Mock Data';
  }
}
