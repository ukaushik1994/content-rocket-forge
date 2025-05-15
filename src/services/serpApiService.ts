
import { supabase } from '@/integrations/supabase/client';
import { SerpAnalysisResult, SerpSearchParams } from '@/types/serp';
import { toast } from 'sonner';

interface SearchKeywordParams {
  query: string;
  refresh?: boolean;
  countries?: string[];
}

export type { SerpAnalysisResult }; // Properly re-export the type

export const searchKeywords = async (params: SearchKeywordParams) => {
  try {
    const { query, refresh = false, countries = ['us'] } = params;
    
    // Get the SERP API key from the user's settings
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', 'serp')
      .eq('is_active', true)
      .single();

    if (!apiKey) {
      console.error('No SERP API key found in settings');
      toast.error('Missing SERP API key. Please add your API key in Settings.');
      return [];
    }
    
    // Make the actual API call to the SERP service
    const response = await fetch('/api/serp/search-keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        refresh,
        countries
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching keywords:', error);
    toast.error('Failed to search keywords. Please check your API connection.');
    return [];
  }
};

export const analyzeKeywordSerp = async (keyword: string, refresh?: boolean, countries: string[] = ['us']): Promise<SerpAnalysisResult | null> => {
  try {
    // Get the SERP API key from the user's settings
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', 'serp')
      .eq('is_active', true)
      .single();

    if (!apiKey) {
      console.warn('No SERP API key found in settings');
      toast.error('Missing SERP API key. Please add your API key in Settings.');
      return null;
    }
    
    // Make the actual API call to the SERP service
    const response = await fetch('/api/serp/analyze-keyword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword,
        refresh,
        countries
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // If no data was returned, inform the user
    if (!data || Object.keys(data).length === 0) {
      toast.warning('No SERP data found for this keyword. Try another keyword or check your API key.');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error analyzing keyword:', error);
    toast.error('Failed to analyze keyword. Please check your API connection.');
    return null;
  }
};

export const searchRelatedKeywords = async (keyword: string, countries: string[] = ['us']) => {
  try {
    // Get the SERP API key from the user's settings
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', 'serp')
      .eq('is_active', true)
      .single();

    if (!apiKey) {
      console.warn('No SERP API key found in settings');
      toast.error('Missing SERP API key. Please add your API key in Settings.');
      return [];
    }
    
    // Make the actual API call to the SERP service
    const response = await fetch('/api/serp/related-keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword,
        countries
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.keywords || [];
  } catch (error) {
    console.error('Error searching related keywords:', error);
    toast.error('Failed to fetch related keywords. Please check your API connection.');
    return [];
  }
};
