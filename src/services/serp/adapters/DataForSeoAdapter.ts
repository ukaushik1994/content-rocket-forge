/**
 * DataForSEO adapter implementation
 */

import { BaseAdapter } from "./BaseAdapter";
import { SerpApiOptions } from "./types";
import { SerpAnalysisResult } from "@/types/serp";
import { decodeDataForSeoCredentials } from '@/services/apiKeys/validation';

export class DataForSeoAdapter extends BaseAdapter {
  constructor() {
    super('dataforseo');
  }
  
  async analyzeKeywordWithApi(apiKey: string, options: SerpApiOptions): Promise<SerpAnalysisResult> {
    const { keyword, refresh, location = '2840', language = 'en' } = options;
    
    // DataForSEO requires base64 encoded API credentials (should already be in this format)
    const credentials = apiKey; // It's already base64 encoded in the format login:password
    
    // We'll need multiple API calls to gather all the data we need
    // 1. Get SERP data for organic results
    const serpResponse = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keyword: keyword,
        location_code: location,
        language_code: language,
        device: 'desktop',
        os: 'windows'
      })
    });
    
    if (!serpResponse.ok) {
      throw new Error(`DataForSEO SERP API error: ${serpResponse.status}`);
    }
    
    const serpData = await serpResponse.json();
    
    // 2. Get keyword data
    const keywordResponse = await fetch('https://api.dataforseo.com/v3/keywords_data/google/search_volume/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keywords: [keyword],
        location_code: location,
        language_code: language
      })
    });
    
    if (!keywordResponse.ok) {
      throw new Error(`DataForSEO Keyword API error: ${keywordResponse.status}`);
    }
    
    const keywordData = await keywordResponse.json();
    
    // 3. Get related keywords
    const relatedResponse = await fetch('https://api.dataforseo.com/v3/keywords_data/google/related_keywords/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keyword: keyword,
        location_code: location,
        language_code: language
      })
    });
    
    if (!relatedResponse.ok) {
      throw new Error(`DataForSEO Related Keywords API error: ${relatedResponse.status}`);
    }
    
    const relatedData = await relatedResponse.json();
    
    // Transform DataForSEO responses to our SerpAnalysisResult format
    return this.transformApiResponses(keyword, serpData, keywordData, relatedData);
  }
  
  private transformApiResponses(
    keyword: string, 
    serpData: any, 
    keywordData: any, 
    relatedData: any
  ): SerpAnalysisResult {
    // Initialize result values
    let searchVolume = 0;
    let keywordDifficulty = 0;
    let competitionScore = 0;
    const keywords: string[] = [];
    const relatedSearches: any[] = [];
    const peopleAlsoAsk: any[] = [];
    const entities: any[] = [];
    const topResults: any[] = [];
    const headings: any[] = [];
    const contentGaps: any[] = [];
    
    // Process keyword data
    if (keywordData.tasks && keywordData.tasks[0] && keywordData.tasks[0].result) {
      const keywordResult = keywordData.tasks[0].result[0];
      if (keywordResult) {
        searchVolume = keywordResult.search_volume || 0;
        competitionScore = keywordResult.competition_index ? keywordResult.competition_index / 100 : 0;
        keywordDifficulty = keywordResult.keyword_difficulty || 0;
      }
    }
    
    // Process SERP data
    if (serpData.tasks && serpData.tasks[0] && serpData.tasks[0].result) {
      const result = serpData.tasks[0].result[0];
      
      // Extract top results
      if (result.items) {
        result.items.forEach((item: any) => {
          if (item.type === 'organic') {
            topResults.push({
              title: item.title,
              link: item.url,
              snippet: item.description,
              position: item.rank_absolute
            });
          } else if (item.type === 'people_also_ask') {
            item.items.forEach((question: any) => {
              peopleAlsoAsk.push({
                question: question.title,
                source: 'search'
              });
            });
          } else if (item.type === 'related_searches') {
            item.items.forEach((related: any) => {
              relatedSearches.push({
                query: related.query
              });
            });
          }
        });
      }
    }
    
    // Process related keywords data
    if (relatedData.tasks && relatedData.tasks[0] && relatedData.tasks[0].result) {
      const relatedResult = relatedData.tasks[0].result;
      
      relatedResult.forEach((item: any) => {
        if (item.keyword) {
          keywords.push(item.keyword);
        }
      });
    }
    
    // Create recommendations based on gathered data
    const recommendations = [
      `Target the keyword "${keyword}" which has ${searchVolume} monthly searches`,
      'Focus on addressing the common questions in your content',
      'Include related keywords in your content to improve relevance',
      'Structure your content with clear headings based on related topics'
    ];
    
    return {
      keyword,
      searchVolume,
      keywordDifficulty,
      competitionScore,
      entities,
      peopleAlsoAsk,
      headings,
      contentGaps,
      topResults,
      relatedSearches,
      keywords,
      recommendations,
      provider: 'dataforseo',
      isMockData: false
    };
  }
  
  async searchKeywordsWithApi(apiKey: string, options: SerpApiOptions): Promise<any[]> {
    const { keyword, limit = 10, location = '2840', language = 'en' } = options;
    
    // DataForSEO requires base64 encoded API credentials
    const credentials = apiKey; // Already base64 encoded
    
    const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keyword: keyword,
        location_code: location,
        language_code: language,
        limit: limit,
        device: 'desktop'
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform DataForSEO response to match the expected format
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
      const results = data.tasks[0].result.map((item: any) => ({
        title: item.title || '',
        url: item.url || '',
        position: item.rank_absolute || item.position,
        snippet: item.description || ''
      }));
      
      return results;
    }
    
    return [];
  }
  
  async searchRelatedKeywordsWithApi(apiKey: string, options: SerpApiOptions): Promise<string[]> {
    const { keyword, location = '2840', language = 'en' } = options;
    
    // DataForSEO requires base64 encoded API credentials
    const credentials = apiKey; // Already base64 encoded
    
    const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google/related_keywords/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keyword: keyword,
        location_code: location,
        language_code: language
      })
    });
    
    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform DataForSEO response to match the expected format
    if (data.tasks && data.tasks[0] && data.tasks[0].result) {
      return data.tasks[0].result.map((item: any) => item.keyword);
    }
    
    return [];
  }
  
  async testApiKeyWithApi(apiKey: string): Promise<boolean> {
    try {
      // Test with a simple API call
      const response = await fetch('https://api.dataforseo.com/v3/merchant/google/locations', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.status_code === 20000;
    } catch (error) {
      console.error('Error testing DataForSEO key:', error);
      return false;
    }
  }
}
