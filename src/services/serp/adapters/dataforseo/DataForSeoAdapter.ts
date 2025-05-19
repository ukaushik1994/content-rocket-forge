
/**
 * DataForSEO adapter for fetching SERP data
 */
import { BaseAdapter } from '../BaseAdapter';
import { testDataForSeoApiKey } from './ApiKeyTester';
import { fetchAnalysis, fetchKeywords, fetchRelatedKeywords } from './ApiRequests';
import { SerpApiOptions } from '../../core/SerpCore';

/**
 * DataForSEO adapter for fetching SERP data
 */
export class DataForSeoAdapter extends BaseAdapter {
  provider = 'dataforseo';
  private apiKey: string = '';

  constructor() {
    super();
    this.loadApiKey();
  }

  /**
   * Load API key from storage
   */
  private loadApiKey() {
    this.apiKey = localStorage.getItem('dataforseo_api_key') || '';
  }

  /**
   * Test if an API key is valid
   */
  async testApiKey(apiKey: string): Promise<boolean> {
    return testDataForSeoApiKey(apiKey);
  }

  /**
   * Analyze a keyword
   */
  async analyzeKeyword(options: SerpApiOptions): Promise<any> {
    // Ensure API key is loaded
    if (!this.apiKey) {
      this.loadApiKey();
    }

    if (!this.apiKey) {
      throw new Error('DataForSEO API key not found');
    }

    // Use the core implementation with our API key
    const result = await this.fetchAnalysis({
      ...options,
      apiKey: this.apiKey
    });
    
    return result;
  }

  /**
   * Implement the abstract methods from BaseAdapter
   */
  protected async fetchAnalysis(options: SerpApiOptions & { apiKey: string }): Promise<any> {
    return fetchAnalysis(options);
  }

  protected async fetchKeywords(options: SerpApiOptions & { apiKey: string }): Promise<any[]> {
    return fetchKeywords(options);
  }

  protected async fetchRelatedKeywords(options: SerpApiOptions & { apiKey: string }): Promise<any[]> {
    return fetchRelatedKeywords(options);
  }

  getProviderName(): string {
    return 'DataForSEO';
  }
}
