
import { supabase } from '@/integrations/supabase/client';
import { SerpAnalysisResult, SerpSearchParams } from '@/types/serp';
import { toast } from 'sonner';

// Mock data for testing when no API key is available
const MOCK_SERP_DATA: SerpAnalysisResult = {
  keyword: "sample keyword",
  searchVolume: 1500,
  competitionScore: 0.65,
  keywordDifficulty: 45,
  topResults: [
    { title: "Sample Top Result 1", link: "https://example.com/1", snippet: "This is a snippet of content from the first result.", position: 1 },
    { title: "Sample Top Result 2", link: "https://example.com/2", snippet: "This is a snippet of content from the second result.", position: 2 },
  ],
  relatedSearches: [
    { query: "related keyword 1", volume: 800 },
    { query: "related keyword 2", volume: 600 },
  ],
  peopleAlsoAsk: [
    { question: "Sample question 1?", source: "example.com", answer: "This is an answer to the first question." },
    { question: "Sample question 2?", source: "example.com", answer: "This is an answer to the second question." },
  ],
  featuredSnippets: [
    { content: "Sample featured snippet content", source: "example.com", type: "paragraph" },
  ],
  entities: [
    { name: "Entity 1", type: "concept", importance: 9, description: "Description of Entity 1" },
    { name: "Entity 2", type: "person", importance: 7, description: "Description of Entity 2" },
  ],
  headings: [
    { text: "Sample Heading 1", level: "h2", subtext: "Subtext for heading 1", type: "informational" },
    { text: "Sample Heading 2", level: "h2", subtext: "Subtext for heading 2", type: "commercial" },
  ],
  contentGaps: [
    { topic: "Missing Topic 1", description: "Description of missing topic 1", recommendation: "You should cover this topic", content: "", opportunity: "high", source: "" },
    { topic: "Missing Topic 2", description: "Description of missing topic 2", recommendation: "You should cover this topic", content: "", opportunity: "medium", source: "" },
  ],
  recommendations: []
};

interface SearchKeywordParams {
  query: string;
  limit?: number;
  refresh?: boolean;
  countries?: string[];
  useMockData?: boolean;
}

export type { SerpAnalysisResult }; // Properly re-export the type with 'export type'

export const searchKeywords = async (params: SearchKeywordParams) => {
  try {
    const { query, limit = 10, refresh = false, countries = ['us'], useMockData = false } = params;
    
    // Get the SERP API key from the user's settings
    const { data: apiKey, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', 'serp')
      .eq('is_active', true)
      .single();

    // Log helpful debugging info
    console.log("SERP API request:", { query, countries, refresh });
    console.log("API Key found:", !!apiKey);
    
    if (apiKeyError) {
      console.error("Error fetching API key:", apiKeyError);
    }

    if (!apiKey && useMockData) {
      console.log("No API key found, using mock data");
      // Return mock related keywords
      return [
        { title: "Related keyword 1", volume: 1200 },
        { title: "Related keyword 2", volume: 900 },
        { title: "Related keyword 3", volume: 750 },
        { title: "Related keyword 4", volume: 600 },
        { title: "Related keyword 5", volume: 450 },
      ].slice(0, limit);
    }
    
    if (!apiKey) {
      toast.error("No SERP API key found. Please add your API key in Settings.");
      console.warn("No SERP API key found in settings");
      return [];
    }
    
    // This would be where we'd make the actual API call with the API key
    // For now, since we're instructed to not show mock data if there's no real data,
    // we'll just return an empty array
    console.log(`Searching keywords for query: ${query} in countries: ${countries.join(', ')}`);
    
    // Return empty results since we don't have a real API call
    return [];
  } catch (error) {
    console.error('Error searching keywords:', error);
    toast.error("Error searching keywords. Check your API key and try again.");
    return [];
  }
};

export const analyzeKeywordSerp = async (
  keyword: string, 
  refresh: boolean = false, 
  countries: string[] = ['us'],
  useMockData: boolean = false
): Promise<SerpAnalysisResult | null> => {
  try {
    console.log(`Analyzing keyword "${keyword}" for regions: ${countries.join(', ')}, refresh: ${refresh}, useMockData: ${useMockData}`);
    
    // Get the SERP API key from the user's settings
    const { data: apiKey, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', 'serp')
      .eq('is_active', true)
      .single();

    if (apiKeyError) {
      console.error("Error fetching SERP API key:", apiKeyError);
    }
    
    console.log("API Key found:", !!apiKey);

    if (!apiKey) {
      if (useMockData) {
        console.log("Using mock SERP data for testing");
        // Use mock data with the provided keyword
        const mockData = { ...MOCK_SERP_DATA, keyword };
        return mockData;
      }
      
      console.warn('No SERP API key found in settings');
      toast.error("No SERP API key found. Please add your API key in Settings.");
      // Return null to indicate no data is available
      return null;
    }
    
    // In a real implementation, we would make an API call here with the apiKey
    // Since we don't have a real API call, we'll return null or mock data
    console.log("Would make API call with key and params:", { keyword, refresh, countries });
    
    if (useMockData) {
      // Return mock data with the actual keyword
      const mockData = { ...MOCK_SERP_DATA, keyword };
      return mockData;
    }
    
    // For now, return null to indicate no data
    return null;
  } catch (error) {
    console.error('Error analyzing keyword:', error);
    toast.error("Error analyzing keyword. Check your API key and try again.");
    return null;
  }
};

export const searchRelatedKeywords = async (keyword: string, countries: string[] = ['us'], useMockData: boolean = false) => {
  try {
    // Get the SERP API key from the user's settings
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', 'serp')
      .eq('is_active', true)
      .single();

    console.log("Related keywords search:", { keyword, countries, apiKeyFound: !!apiKey });

    if (!apiKey && useMockData) {
      console.log("Using mock related keywords");
      // Return mock related keywords
      return [
        { query: `${keyword} guide`, volume: 1200 },
        { query: `best ${keyword}`, volume: 900 },
        { query: `${keyword} tips`, volume: 750 },
        { query: `how to ${keyword}`, volume: 600 },
        { query: `${keyword} examples`, volume: 450 },
      ];
    }
    
    if (!apiKey) {
      toast.warning("No API key available for related keywords.");
      return [];
    }
    
    // In a real implementation, this would make an API call
    // Since we don't have a real API call, we'll return an empty array
    console.log(`Searching related keywords for: ${keyword} in countries: ${countries.join(', ')}`);
    return [];
  } catch (error) {
    console.error('Error searching related keywords:', error);
    toast.error("Error searching related keywords.");
    return [];
  }
};

