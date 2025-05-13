
import { supabase } from '@/integrations/supabase/client';
import { SerpAnalysisResult, SerpSearchParams } from '@/types/serp';

interface SearchKeywordParams {
  query: string;
  limit?: number;
  refresh?: boolean;
  countries?: string[];
}

export type { SerpAnalysisResult }; // Properly re-export the type with 'export type'

export const searchKeywords = async (params: SearchKeywordParams) => {
  try {
    const { query, limit = 10, refresh = false, countries = ['us'] } = params;
    
    // Get the SERP API key from the user's settings
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', 'serp')
      .eq('is_active', true)
      .single();

    if (!apiKey) {
      console.error('No SERP API key found in settings');
      return [];
    }
    
    // This would be where we'd make the actual API call with the API key
    // For now, since we're instructed to not show mock data if there's no real data,
    // we'll just return an empty array
    console.log(`Searching keywords for query: ${query} in countries: ${countries.join(', ')}`);
    
    // Return empty results since we don't want to show mock data
    return [];
  } catch (error) {
    console.error('Error searching keywords:', error);
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
      // Return null to indicate no data is available instead of using mock data
      return null;
    }
    
    // In a real implementation, we would make an API call here with the apiKey
    // Since we don't want to use mock data, we'll return null to indicate no data found
    return null;
  } catch (error) {
    console.error('Error analyzing keyword:', error);
    return null;
  }
};

export const searchRelatedKeywords = async (keyword: string, countries: string[] = ['us']) => {
  try {
    // In a real implementation, this would make an API call
    // Since we don't want to use mock data, we'll return an empty array
    console.log(`Searching related keywords for: ${keyword} in countries: ${countries.join(', ')}`);
    return [];
  } catch (error) {
    console.error('Error searching related keywords:', error);
    return [];
  }
};
