
import { toast } from 'sonner';
import { SearchKeywordParams, SerpAnalysisResult } from './types';
import { getSerpApiKey, callSerpApi } from './apiProxy';
import { generateMockData, generateMockRelatedKeywords } from './mockData';
import { processSerpResponse } from './processing';

/**
 * Search for keywords using SERP API
 */
export const searchKeywords = async (params: SearchKeywordParams) => {
  try {
    const { query, countries = ['us'] } = params;
    
    // Get the API key
    const apiKey = await getSerpApiKey();
    if (!apiKey) return [];
    
    console.log('SERP API key found, making API request with countries:', countries);
    
    try {
      // Call the SERP API
      const data = await callSerpApi('search', {
        engine: 'google',
        q: query,
        location: countries[0] || 'us',
        gl: countries[0] || 'us'
      }, apiKey);
      
      console.log("SERP search response:", data);
      
      // Extract relevant results from the response
      const organicResults = data.organic_results || [];
      const relatedSearches = data.related_searches || [];
      
      return [...organicResults, ...relatedSearches];
    } catch (error) {
      console.error('Error searching keywords:', error);
      toast.error('Failed to search keywords. Please check your API connection.');
      return [];
    }
  } catch (error) {
    console.error('Error searching keywords:', error);
    toast.error('Failed to search keywords. Please check your API connection.');
    return [];
  }
};

/**
 * Analyze a keyword using SERP API and process the results
 */
export const analyzeKeywordSerp = async (
  keyword: string, 
  refresh?: boolean, 
  countries: string[] = ['us']
): Promise<SerpAnalysisResult | null> => {
  try {
    console.log('Analyzing keyword:', keyword, 'refresh:', refresh, 'countries:', countries);
    
    // Get the API key
    const apiKey = await getSerpApiKey();
    if (!apiKey) {
      console.warn('No valid SERP API key found');
      
      // Return mock data as a fallback
      const mockData = generateMockData(keyword, countries);
      return processSerpResponse(mockData);
    }
    
    console.log('SERP API key found, making API request with countries:', countries);
    
    try {
      // Use the first country as the primary location
      const primaryCountry = countries[0] || 'us';
      
      // Call the SERP API
      const data = await callSerpApi('search', {
        engine: 'google',
        q: keyword,
        location: primaryCountry,
        gl: primaryCountry,
        num: '10'
      }, apiKey);
      
      console.log("Raw SERP API response:", data);
      
      // If no data was returned, inform the user
      if (!data || Object.keys(data).length === 0) {
        toast.warning('No SERP data found for this keyword. Try another keyword or check your API key.');
        
        // Return mock data for development
        console.log("Using mock data as fallback");
        const mockData = generateMockData(keyword, countries);
        return processSerpResponse(mockData);
      }
      
      // Add the search countries to the response data
      data.searchCountries = countries;
      data.isMockData = false;
      
      // Process and normalize the response
      const processedData = processSerpResponse(data);
      console.log("Processed SERP data:", processedData);
      
      return processedData;
      
    } catch (error) {
      console.warn('All attempts to call SERP API failed:', error);
      console.log("Using mock data as error fallback");
      toast.warning('Using demo data due to API connection issues.');
      
      // Return mock data as a fallback
      const mockData = generateMockData(keyword, countries);
      return processSerpResponse(mockData);
    }
  } catch (error) {
    console.error('Error analyzing keyword:', error);
    toast.error('Failed to analyze keyword. Please check your API connection.');
    return null;
  }
};

/**
 * Search for related keywords based on a main keyword
 */
export const searchRelatedKeywords = async (keyword: string, countries: string[] = ['us']) => {
  try {
    // Get the API key
    const apiKey = await getSerpApiKey();
    if (!apiKey) {
      // Return mock data as a fallback
      return generateMockRelatedKeywords(keyword);
    }
    
    console.log('SERP API key found, making API request with countries:', countries);
    
    try {
      // Use the first country as the primary location
      const primaryCountry = countries[0] || 'us';
      
      // Call the SERP API
      const data = await callSerpApi('search', {
        engine: 'google',
        q: keyword,
        location: primaryCountry,
        gl: primaryCountry,
      }, apiKey);
      
      console.log("Related keywords response:", data);
      
      // Extract related searches from the response
      const relatedSearches = data.related_searches || [];
      const keywords = relatedSearches.map((item: any) => item.query || '');
      
      return keywords.length > 0 ? keywords : generateMockRelatedKeywords(keyword);
      
    } catch (error) {
      console.warn('Call to SERP API failed:', error);
      console.log("Using mock keywords as error fallback");
      toast.warning('Using demo keywords due to API connection issues.');
      
      // Return mock data as a fallback
      return generateMockRelatedKeywords(keyword);
    }
  } catch (error) {
    console.error('Error searching related keywords:', error);
    toast.error('Failed to fetch related keywords. Please check your API connection.');
    return [];
  }
};
