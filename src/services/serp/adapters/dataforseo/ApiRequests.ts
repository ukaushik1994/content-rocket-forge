
/**
 * Implementation of DataForSEO API requests
 */

import { SerpApiOptions } from '../../core/SerpCore';
import { SerpAnalysisResult } from '@/types/serp';
import { decodeDataForSeoCredentials } from '@/services/apiKeys/testing';

// Base URLs for DataForSEO API endpoints
const DATAFORSEO_BASE_URL = 'https://api.dataforseo.com/v3';
const SERP_ENDPOINT = '/serp/google/organic/live/advanced';
const RELATED_ENDPOINT = '/serp/google/related_searches/live/advanced';
const EXPLORER_ENDPOINT = '/keywords_data/google/search_volume/live';

/**
 * Make a request to DataForSEO API
 */
async function makeDataForSeoRequest(endpoint: string, payload: any, apiKey: string): Promise<any> {
  try {
    // Decode credentials from apiKey (which is base64 encoded)
    const credentials = decodeDataForSeoCredentials(apiKey);
    if (!credentials) {
      throw new Error('Invalid DataForSEO credentials format');
    }
    
    const { login, password } = credentials;
    
    // FIXED: Create authorization header correctly for HTTP Basic Auth
    // Use the raw login:password format before encoding to base64
    const authStr = `${login}:${password}`;
    const auth = Buffer.from(authStr).toString('base64');
    
    console.log(`Making DataForSEO request to ${endpoint}`);
    
    // Make API request
    const response = await fetch(`${DATAFORSEO_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO API error (${response.status}):`, errorText);
      throw new Error(`DataForSEO API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('DataForSEO API request failed:', error);
    throw error;
  }
}

/**
 * Fetch SERP analysis data from DataForSEO
 */
export async function fetchAnalysis(options: SerpApiOptions & { apiKey: string }): Promise<SerpAnalysisResult | null> {
  try {
    console.log('Fetching analysis from DataForSEO for:', options.keyword);
    
    // Define the payload for the API request
    const payload = [
      {
        keyword: options.keyword,
        location_name: options.location || "United States",
        language_name: options.language || "English",
        device: "desktop",
        se_domain: "google.com",
        depth: 100
      }
    ];
    
    // Make the API request
    const response = await makeDataForSeoRequest(SERP_ENDPOINT, payload, options.apiKey);
    
    // Check if the response has valid data
    if (!response || !response.tasks || response.tasks.length === 0) {
      console.error('No tasks in DataForSEO response');
      return null;
    }
    
    // Check for errors in the task
    const task = response.tasks[0];
    if (task.status_code !== 20000 || !task.result || task.result.length === 0) {
      console.error('Error or no results in DataForSEO task:', task.status_message);
      return null;
    }
    
    // Get the search results
    const result = task.result[0];
    const organicResults = result.items || [];
    
    // Extract the "People Also Ask" questions from the API response
    const paaItems = extractPeopleAlsoAsk(result);
    
    // Extract related searches
    const relatedSearches = await fetchRelatedKeywords(options);
    
    // Get search volume data
    const volumeData = await fetchSearchVolume(options);
    
    // Transform the raw API data to our application's format
    return {
      provider: 'dataforseo',
      keyword: options.keyword,
      searchVolume: volumeData?.searchVolume || 0,
      keywordDifficulty: volumeData?.keywordDifficulty || 0,
      competitionScore: volumeData?.competition || 0,
      cpc: volumeData?.cpc || 0,
      timestamp: new Date().toISOString(),
      
      // Transform organic results to top results format
      topResults: organicResults.slice(0, 10).map((item: any, index: number) => ({
        position: index + 1,
        title: item.title || '',
        url: item.url || '',
        description: item.description || '',
        domain: extractDomain(item.url || '')
      })),
      
      // Map People Also Ask questions
      peopleAlsoAsk: paaItems,
      
      // Map related searches
      relatedSearches: relatedSearches || [],
      
      // Extract headings from the content (simplified implementation)
      headings: extractHeadingsFromResults(organicResults)
    };
  } catch (error) {
    console.error('Error fetching DataForSEO analysis:', error);
    return null;
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * Extract People Also Ask questions from results
 */
function extractPeopleAlsoAsk(result: any): any[] {
  try {
    // Look for People Also Ask boxes in the SERP features
    const paaBoxes = (result.feature_elements || [])
      .filter((feature: any) => feature.feature === 'people_also_ask');
    
    // If we found any, extract the questions and answers
    if (paaBoxes.length > 0 && paaBoxes[0].items) {
      return paaBoxes[0].items.map((item: any) => ({
        question: item.text || '',
        answer: item.answer || ''
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error extracting People Also Ask data:', error);
    return [];
  }
}

/**
 * Extract headings from the organic results
 */
function extractHeadingsFromResults(organicResults: any[]): any[] {
  const headings: any[] = [];
  
  try {
    // Extract potential headings from titles and descriptions
    organicResults.forEach((result: any, index: number) => {
      if (index < 5 && result.title) {
        headings.push({
          text: result.title,
          level: 'h2',
          subtext: result.description || ''
        });
      }
    });
    
    return headings;
  } catch (error) {
    console.error('Error extracting headings from results:', error);
    return [];
  }
}

/**
 * Fetch keyword search volume data
 */
async function fetchSearchVolume(options: SerpApiOptions & { apiKey: string }): Promise<any> {
  try {
    // Define the payload for the API request
    const payload = [
      {
        keywords: [options.keyword],
        location_name: options.location || "United States",
        language_name: options.language || "English"
      }
    ];
    
    // Make the API request
    const response = await makeDataForSeoRequest(EXPLORER_ENDPOINT, payload, options.apiKey);
    
    // Check if the response has valid data
    if (!response || !response.tasks || response.tasks.length === 0) {
      console.error('No tasks in DataForSEO search volume response');
      return null;
    }
    
    // Check for errors in the task
    const task = response.tasks[0];
    if (task.status_code !== 20000 || !task.result || task.result.length === 0) {
      console.error('Error or no results in DataForSEO search volume task:', task.status_message);
      return null;
    }
    
    // Get the volume data for the keyword
    const keywordData = task.result.find((item: any) => 
      item.keyword.toLowerCase() === options.keyword.toLowerCase()
    );
    
    if (!keywordData) {
      console.error('No volume data found for keyword:', options.keyword);
      return null;
    }
    
    return {
      searchVolume: keywordData.search_volume || 0,
      keywordDifficulty: Math.round((keywordData.keyword_difficulty || 0) * 100) || 0,
      competition: keywordData.competition_index || 0,
      cpc: keywordData.cpc || 0
    };
  } catch (error) {
    console.error('Error fetching DataForSEO search volume data:', error);
    return null;
  }
}

/**
 * Fetch keyword suggestions from DataForSEO
 */
export async function fetchKeywords(options: SerpApiOptions & { apiKey: string }): Promise<any[]> {
  try {
    console.log('Fetching keywords from DataForSEO for:', options.keyword);
    
    // Use the related searches API since it provides keyword suggestions
    const relatedSearches = await fetchRelatedKeywords(options);
    
    // Return the first batch of keyword suggestions
    return relatedSearches.slice(0, options.limit || 10);
    
  } catch (error) {
    console.error('Error fetching DataForSEO keywords:', error);
    return [];
  }
}

/**
 * Fetch related keywords from DataForSEO
 */
export async function fetchRelatedKeywords(options: SerpApiOptions & { apiKey: string }): Promise<any[]> {
  try {
    console.log('Fetching related keywords from DataForSEO for:', options.keyword);
    
    // Define the payload for the API request
    const payload = [
      {
        keyword: options.keyword,
        location_name: options.location || "United States",
        language_name: options.language || "English",
        device: "desktop",
        se_domain: "google.com"
      }
    ];
    
    // Make the API request
    const response = await makeDataForSeoRequest(RELATED_ENDPOINT, payload, options.apiKey);
    
    // Check if the response has valid data
    if (!response || !response.tasks || response.tasks.length === 0) {
      console.error('No tasks in DataForSEO related searches response');
      return [];
    }
    
    // Check for errors in the task
    const task = response.tasks[0];
    if (task.status_code !== 20000 || !task.result || task.result.length === 0) {
      console.error('Error or no results in DataForSEO related searches task:', task.status_message);
      return [];
    }
    
    // Extract related searches
    const relatedItems = task.result[0].items || [];
    
    // Transform to our application format
    return relatedItems.map((item: any) => ({
      query: item.title || '',
      url: item.url || '',
      searchVolume: 0, // Not available in this API response
      difficulty: 0 // Not available in this API response
    }));
    
  } catch (error) {
    console.error('Error fetching DataForSEO related keywords:', error);
    return [];
  }
}
