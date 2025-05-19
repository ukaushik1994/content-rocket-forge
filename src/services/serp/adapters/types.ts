
/**
 * Interface for SERP API adapters
 */
export interface SerpApiAdapter {
  provider: string;
  testApiKey(apiKey: string): Promise<boolean>;
  analyzeKeyword(options: any): Promise<any>;
  searchKeywords(options: any): Promise<any[]>;
  searchRelatedKeywords(options: any): Promise<any[]>;
  getProviderName(): string;
}
