
/**
 * Base adapter for SERP API providers
 * Implements common functionality and error handling
 */

import { SerpApiAdapter, SerpApiOptions, SerpApiResponse } from "./types";
import { SerpAnalysisResult } from "@/types/serp";
import { SerpProvider } from "@/contexts/content-builder/types/serp-types";
import { getApiKey } from "@/services/apiKeys/storage";
import { processSerpResponse } from "@/services/serpProcessingService";
import { generateMockSerpData } from "../mockData";
import { toast } from "sonner";

export abstract class BaseAdapter implements SerpApiAdapter {
  provider: SerpProvider;
  
  constructor(provider: SerpProvider) {
    this.provider = provider;
  }
  
  /**
   * Method to be implemented by specific provider adapters
   */
  abstract analyzeKeywordWithApi(apiKey: string, options: SerpApiOptions): Promise<SerpAnalysisResult>;
  abstract searchKeywordsWithApi(apiKey: string, options: SerpApiOptions): Promise<any[]>;
  abstract searchRelatedKeywordsWithApi(apiKey: string, options: SerpApiOptions): Promise<string[]>;
  abstract testApiKeyWithApi(apiKey: string): Promise<boolean>;
  
  /**
   * Analyze a keyword using the provider API
   */
  async analyzeKeyword(options: SerpApiOptions): Promise<SerpAnalysisResult> {
    try {
      const apiKey = await getApiKey(this.provider);
      
      if (!apiKey) {
        console.warn(`No API key found for ${this.provider}, using mock data`);
        this.notifyMissingApiKey();
        return generateMockSerpData(options.keyword, options.refresh);
      }
      
      try {
        const result = await this.analyzeKeywordWithApi(apiKey, options);
        return result;
      } catch (error) {
        console.error(`Error calling ${this.provider} API:`, error);
        toast.error(`Error analyzing keyword. Using backup data.`);
        return generateMockSerpData(options.keyword, options.refresh);
      }
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      return generateMockSerpData(options.keyword, options.refresh);
    }
  }
  
  /**
   * Search for keywords using the provider API
   */
  async searchKeywords(options: SerpApiOptions): Promise<any[]> {
    try {
      const apiKey = await getApiKey(this.provider);
      
      if (!apiKey) {
        console.warn(`No API key found for ${this.provider}, using mock data`);
        this.notifyMissingApiKey();
        return this.getMockSearchResults(options.keyword, options.refresh);
      }
      
      try {
        return await this.searchKeywordsWithApi(apiKey, options);
      } catch (error) {
        console.error(`Error calling ${this.provider} API:`, error);
        toast.error(`Error fetching keyword data. Using mock data instead.`);
        return this.getMockSearchResults(options.keyword, options.refresh);
      }
    } catch (error) {
      console.error('Error searching keywords:', error);
      return this.getMockSearchResults(options.keyword, options.refresh);
    }
  }
  
  /**
   * Search for related keywords using the provider API
   */
  async searchRelatedKeywords(options: SerpApiOptions): Promise<string[]> {
    try {
      const apiKey = await getApiKey(this.provider);
      
      if (!apiKey) {
        console.warn(`No API key found for ${this.provider}, using mock data`);
        this.notifyMissingApiKey();
        return this.getMockRelatedKeywords(options.keyword);
      }
      
      try {
        return await this.searchRelatedKeywordsWithApi(apiKey, options);
      } catch (error) {
        console.error(`Error fetching related keywords from ${this.provider}:`, error);
        return this.getMockRelatedKeywords(options.keyword);
      }
    } catch (error) {
      console.error('Error searching related keywords:', error);
      return this.getMockRelatedKeywords(options.keyword);
    }
  }
  
  /**
   * Test if an API key is valid
   */
  async testApiKey(apiKey: string): Promise<boolean> {
    try {
      return await this.testApiKeyWithApi(apiKey);
    } catch (error) {
      console.error(`Error testing ${this.provider} API key:`, error);
      return false;
    }
  }
  
  /**
   * Helper method to notify user of missing API key
   */
  protected notifyMissingApiKey(): void {
    toast.warning(`No API key found for ${this.provider}. Add your API key in Settings for real data.`, {
      duration: 5000,
      action: {
        label: "Settings",
        onClick: () => {
          window.location.href = "/settings/api";
        }
      }
    });
  }
  
  /**
   * Helper method to get mock search results
   */
  protected getMockSearchResults(query: string, refresh?: boolean): any[] {
    const mockResults = [
      { title: `How to Use ${query} Effectively`, url: 'https://example.com/1' },
      { title: `The Ultimate Guide to ${query}`, url: 'https://example.com/2' },
      { title: `10 Best ${query} Strategies`, url: 'https://example.com/3' },
      { title: `Why ${query} Matters for SEO`, url: 'https://example.com/4' },
      { title: `Understanding ${query} for Beginners`, url: 'https://example.com/5' },
      { title: `${query} vs Traditional Methods`, url: 'https://example.com/6' },
      { title: `The Future of ${query} in 2025`, url: 'https://example.com/7' },
      { title: `How to Measure ${query} Success`, url: 'https://example.com/8' },
      { title: `${query} Best Practices`, url: 'https://example.com/9' },
      { title: `${query} Case Studies`, url: 'https://example.com/10' },
    ];
    
    if (refresh) {
      return mockResults
        .map(item => ({ 
          ...item, 
          title: item.title.replace(query, `${query} ${['Expert', 'Professional', 'Advanced', 'Strategic'][Math.floor(Math.random() * 4)]}`)
        }))
        .sort(() => Math.random() - 0.5);
    }
    
    return mockResults;
  }
  
  /**
   * Helper method to get mock related keywords
   */
  protected getMockRelatedKeywords(keyword: string): string[] {
    return [
      `${keyword} strategy`,
      `${keyword} tools`,
      `best ${keyword} practices`,
      `${keyword} guide`,
      `${keyword} tutorial`,
      `${keyword} examples`,
      `${keyword} techniques`,
      `${keyword} trends`,
    ];
  }
}
