
import { BaseAdapter } from '../BaseAdapter';
import { testDataForSeoApiKey } from './ApiKeyTester';
import { fetchAnalysis, fetchKeywords, fetchRelatedKeywords } from './ApiRequests';

/**
 * DataForSEO adapter for fetching SERP data
 */
export class DataForSeoAdapter extends BaseAdapter {
  provider = 'dataforseo';

  constructor() {
    super();
  }

  /**
   * Test if an API key is valid
   */
  async testApiKey(apiKey: string): Promise<boolean> {
    return testDataForSeoApiKey(apiKey);
  }

  /**
   * Implement the abstract methods from BaseAdapter
   */
  protected async fetchAnalysis(options: any): Promise<any> {
    return fetchAnalysis(options);
  }

  protected async fetchKeywords(options: any): Promise<any[]> {
    return fetchKeywords(options);
  }

  protected async fetchRelatedKeywords(options: any): Promise<any[]> {
    return fetchRelatedKeywords(options);
  }

  getProviderName(): string {
    return 'DataForSEO';
  }
}
