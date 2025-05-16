
import { supabase } from '@/integrations/supabase/client';
import { SerpAnalysisResult, SerpSearchParams } from '@/types/serp';
import { toast } from 'sonner';
import { processSerpResponse } from './serpProcessingService';
import { getApiKey } from './apiKeyService';
import { decryptKey } from './apiKeys/encryption';

interface SearchKeywordParams {
  query: string;
  refresh?: boolean;
  countries?: string[];
}

export type { SerpAnalysisResult }; // Properly re-export the type

// Helper function to create a proxy URL for SERP API calls
const createProxyUrl = (endpoint: string, params: Record<string, string>) => {
  // Convert params to a query string for the proxy
  const queryString = new URLSearchParams(params).toString();
  return `/api/proxy/serp?endpoint=${encodeURIComponent(endpoint)}&${queryString}`;
};

export const searchKeywords = async (params: SearchKeywordParams) => {
  try {
    const { query, refresh = false, countries = ['us'] } = params;
    
    // Use the apiKeyService to get the API key
    const apiKey = await getApiKey('serp');
    if (!apiKey) {
      console.error('No SERP API key found in settings');
      toast.error('Missing SERP API key. Please add your API key in Settings → API.');
      return [];
    }
    
    // Decrypt the key
    const decryptedKey = decryptKey(apiKey);
    if (!decryptedKey) {
      console.error('Failed to decrypt SERP API key');
      toast.error('Error with API key. Please try re-adding your API key in Settings.');
      return [];
    }
    
    console.log('SERP API key found, making API request with countries:', countries);
    
    try {
      // First try using direct API call with fetch
      const searchParams = new URLSearchParams({
        engine: 'google',
        q: query,
        api_key: decryptedKey,
        location: countries[0] || 'us',
        gl: countries[0] || 'us'
      });

      const url = `https://serpapi.com/search?${searchParams.toString()}`;
      
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log("SERP search response:", data);
        
        // Extract relevant results from the response
        const organicResults = data.organic_results || [];
        const relatedSearches = data.related_searches || [];
        
        return [...organicResults, ...relatedSearches];
      } catch (fetchError) {
        console.warn('Direct fetch to SERP API failed, likely due to CORS. Trying proxy...', fetchError);
        
        // If direct fetch fails due to CORS, use our local proxy instead
        const proxyParams = {
          engine: 'google',
          q: query,
          api_key: decryptedKey,
          location: countries[0] || 'us',
          gl: countries[0] || 'us'
        };
        
        const proxyUrl = createProxyUrl('search', proxyParams);
        const proxyResponse = await fetch(proxyUrl);
        
        if (!proxyResponse.ok) {
          throw new Error(`Proxy API request failed with status ${proxyResponse.status}`);
        }
        
        const proxyData = await proxyResponse.json();
        console.log("SERP search proxy response:", proxyData);
        
        // Extract relevant results from the response
        const organicResults = proxyData.organic_results || [];
        const relatedSearches = proxyData.related_searches || [];
        
        return [...organicResults, ...relatedSearches];
      }
    } catch (error) {
      console.error('All attempts to call SERP API failed:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error searching keywords:', error);
    toast.error('Failed to search keywords. Please check your API connection.');
    return [];
  }
};

export const analyzeKeywordSerp = async (keyword: string, refresh?: boolean, countries: string[] = ['us']): Promise<SerpAnalysisResult | null> => {
  try {
    console.log('Analyzing keyword:', keyword, 'refresh:', refresh, 'countries:', countries);
    
    // Use the apiKeyService to get the API key
    const apiKey = await getApiKey('serp');
    if (!apiKey) {
      console.warn('No SERP API key found in settings');
      toast.error('Missing SERP API key. Please add your API key in Settings → API.');
      return null;
    }
    
    // Decrypt the key
    const decryptedKey = decryptKey(apiKey);
    if (!decryptedKey) {
      console.error('Failed to decrypt SERP API key');
      toast.error('Error with API key. Please try re-adding your API key in Settings.');
      return null;
    }
    
    console.log('SERP API key found, making API request with countries:', countries);
    
    // Use the first country as the primary location
    const primaryCountry = countries[0] || 'us';

    // Mock data for development/testing when API calls fail
    const mockData = {
      keyword: keyword,
      searchVolume: 1200,
      competitionScore: 0.65,
      keywordDifficulty: 45,
      topResults: [
        {
          title: "How to Create Financial Reports - A Complete Guide",
          link: "https://example.com/finance-reports-guide",
          snippet: "Learn how to create comprehensive financial reports with our step-by-step guide. Includes templates and best practices.",
          position: 1
        },
        {
          title: "Financial Reporting 101: Templates & Examples",
          link: "https://example.com/financial-reporting",
          snippet: "Download our free financial report templates and see examples of professional financial reports for businesses of all sizes.",
          position: 2
        },
        {
          title: "Annual Financial Reports: Everything You Need to Know",
          link: "https://example.com/annual-reports",
          snippet: "Comprehensive guide to creating annual financial reports. Learn about requirements, deadlines, and common mistakes to avoid.",
          position: 3
        }
      ],
      relatedSearches: [
        { query: "financial statement templates", volume: 880 },
        { query: "how to read financial reports", volume: 720 },
        { query: "annual report examples", volume: 590 },
        { query: "quarterly financial report format", volume: 450 }
      ],
      peopleAlsoAsk: [
        { question: "What should be included in a financial report?", source: "https://example.com/financial-report-components" },
        { question: "How often should financial reports be created?", source: "https://example.com/reporting-frequency" },
        { question: "What is the difference between a financial report and a financial statement?", source: "https://example.com/reports-vs-statements" }
      ],
      entities: [
        { name: "Income Statement", type: "document", importance: 9, description: "A financial statement showing revenues and expenses" },
        { name: "Balance Sheet", type: "document", importance: 8, description: "A financial statement showing assets, liabilities and equity" },
        { name: "Cash Flow Statement", type: "document", importance: 7, description: "A financial statement showing cash inflows and outflows" }
      ],
      headings: [
        { text: "Components of Financial Reports", level: "h2" },
        { text: "Creating an Effective Income Statement", level: "h2" },
        { text: "Balance Sheet Best Practices", level: "h2" },
        { text: "Cash Flow Analysis Techniques", level: "h3" },
        { text: "Financial Ratio Analysis", level: "h2" }
      ],
      contentGaps: [
        { topic: "Financial Report Automation Tools", description: "Tools and software for automating financial reporting processes" },
        { topic: "Regulatory Compliance in Financial Reporting", description: "How to ensure your financial reports meet industry regulations" }
      ],
      keywords: [
        "financial reports", 
        "annual reports", 
        "quarterly reports", 
        "income statement", 
        "balance sheet", 
        "cash flow statement", 
        "financial analysis", 
        "financial reporting software"
      ],
      searchCountries: countries,
      isMockData: true
    };
    
    try {
      // First try using direct API call
      const searchParams = new URLSearchParams({
        engine: 'google',
        q: keyword,
        api_key: decryptedKey,
        location: primaryCountry,
        gl: primaryCountry,
        num: '10'
      });

      const url = `https://serpapi.com/search?${searchParams.toString()}`;
      
      try {
        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("Raw SERP API response:", data);
        
        // If no data was returned, inform the user
        if (!data || Object.keys(data).length === 0) {
          toast.warning('No SERP data found for this keyword. Try another keyword or check your API key.');
          // Return mock data for development (can be removed in production)
          console.log("Using mock data as fallback");
          mockData.isMockData = true;
          return processSerpResponse(mockData);
        }
        
        // Add the search countries to the response data
        data.searchCountries = countries;
        data.isMockData = false;
        
        // Process and normalize the response
        const processedData = processSerpResponse(data);
        console.log("Processed SERP data:", processedData);
        
        return processedData;
        
      } catch (fetchError) {
        console.warn('Direct fetch to SERP API failed, likely due to CORS:', fetchError);
        console.log("Using mock data as CORS fallback");
        toast.warning('Using demo data due to API connection issues.');
        
        // Return mock data as a fallback when API fails
        mockData.isMockData = true;
        return processSerpResponse(mockData);
      }
    } catch (error) {
      console.error('All attempts to call SERP API failed:', error);
      console.log("Using mock data as error fallback");
      toast.warning('Using demo data due to API connection issues.');
      
      // Return mock data as a fallback when all API attempts fail
      mockData.isMockData = true;
      return processSerpResponse(mockData);
    }
  } catch (error) {
    console.error('Error analyzing keyword:', error);
    toast.error('Failed to analyze keyword. Please check your API connection.');
    return null;
  }
};

export const searchRelatedKeywords = async (keyword: string, countries: string[] = ['us']) => {
  try {
    // Use the apiKeyService to get the API key
    const apiKey = await getApiKey('serp');
    if (!apiKey) {
      console.warn('No SERP API key found in settings');
      toast.error('Missing SERP API key. Please add your API key in Settings → API.');
      return [];
    }
    
    // Decrypt the key
    const decryptedKey = decryptKey(apiKey);
    if (!decryptedKey) {
      console.error('Failed to decrypt SERP API key');
      toast.error('Error with API key. Please try re-adding your API key in Settings.');
      return [];
    }
    
    console.log('SERP API key found, making API request with countries:', countries);
    
    // Mock data for development/testing
    const mockRelatedKeywords = [
      `${keyword} templates`,
      `${keyword} examples`, 
      `how to create ${keyword}`,
      `${keyword} best practices`,
      `${keyword} software`,
      `${keyword} analysis tools`,
      `${keyword} regulations`,
      `${keyword} formats`
    ];
    
    try {
      // Use the first country as the primary location
      const primaryCountry = countries[0] || 'us';
      
      // First try direct API call
      const searchParams = new URLSearchParams({
        engine: 'google',
        q: keyword,
        api_key: decryptedKey,
        location: primaryCountry,
        gl: primaryCountry,
      });

      const url = `https://serpapi.com/search?${searchParams.toString()}`;
      
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("Related keywords response:", data);
        
        // Extract related searches from the response
        const relatedSearches = data.related_searches || [];
        const keywords = relatedSearches.map((item: any) => item.query || '');
        
        return keywords.length > 0 ? keywords : mockRelatedKeywords;
        
      } catch (fetchError) {
        console.warn('Direct fetch to SERP API failed, likely due to CORS:', fetchError);
        console.log("Using mock keywords as CORS fallback");
        toast.warning('Using demo keywords due to API connection issues.');
        
        // Return mock data as a fallback
        return mockRelatedKeywords;
      }
    } catch (error) {
      console.error('All attempts to call SERP API failed:', error);
      console.log("Using mock keywords as error fallback");
      
      // Return mock data as a fallback when all API attempts fail
      return mockRelatedKeywords;
    }
  } catch (error) {
    console.error('Error searching related keywords:', error);
    toast.error('Failed to fetch related keywords. Please check your API connection.');
    return [];
  }
};
