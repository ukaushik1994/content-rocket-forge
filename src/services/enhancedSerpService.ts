
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EnhancedSerpMetrics {
  search_volume: number;
  competition_pct: number;
  result_count: number;
  seo_difficulty: number;
  opportunity_score: number;
}

export interface SerpBlock {
  organic: any[];
  ads: any[];
  people_also_ask: any[];
  top_stories: any[];
  images: any[];
  videos: any[];
  knowledge_graph: any | null;
}

export interface EnhancedSerpResult {
  keyword: string;
  geo: string;
  metrics: EnhancedSerpMetrics;
  serp_blocks: SerpBlock;
  related_keywords: Array<{ title: string; volume?: number }>;
  insights: string[];
  timestamp: string;
  data_sources: {
    volume_api: boolean;
    serp_api: boolean;
    is_cached: boolean;
  };
}

/**
 * Analyze keyword using the enhanced SERP service
 */
export const analyzeKeywordEnhanced = async (
  keyword: string, 
  geo: string = 'US',
  forceRefresh: boolean = false
): Promise<EnhancedSerpResult | null> => {
  try {
    console.log(`🚀 Enhanced SERP analysis for: "${keyword}" in ${geo}`);
    
    const { data, error } = await supabase.functions.invoke('keyword-serp', {
      body: {
        keyword,
        geo,
        forceRefresh
      }
    });

    if (error) {
      console.error('❌ Enhanced SERP API error:', error);
      throw new Error(`Enhanced SERP API error: ${error.message || JSON.stringify(error)}`);
    }

    if (!data) {
      console.warn('⚠️ No data returned from enhanced SERP API');
      return null;
    }

    console.log('✅ Enhanced SERP data retrieved successfully');
    console.log('📊 Data sources:', data.data_sources);
    console.log('📈 Metrics:', data.metrics);
    
    return data as EnhancedSerpResult;
    
  } catch (error) {
    console.error('💥 Error in enhanced SERP analysis:', error);
    toast.error(`Enhanced SERP analysis failed: ${error.message}`);
    return null;
  }
};

/**
 * Get cached SERP data for a keyword
 */
export const getCachedSerpData = async (
  keyword: string,
  geo: string = 'US'
): Promise<EnhancedSerpResult | null> => {
  try {
    const { data, error } = await supabase
      .from('serp_cache')
      .select('*')
      .eq('keyword', keyword)
      .eq('geo', geo)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if cache is still valid (24 hours)
    const cacheAge = Date.now() - new Date(data.updated_at).getTime();
    const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

    if (cacheAge < cacheExpiry) {
      // Safely parse the payload as EnhancedSerpResult
      const payload = data.payload as any;
      
      // Ensure payload is an object and has the required structure
      if (payload && typeof payload === 'object' && payload.data_sources) {
        return {
          ...payload,
          data_sources: {
            ...payload.data_sources,
            is_cached: true
          }
        } as EnhancedSerpResult;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting cached SERP data:', error);
    return null;
  }
};

/**
 * Clear cache for a specific keyword
 */
export const clearSerpCache = async (keyword: string, geo: string = 'US'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('serp_cache')
      .delete()
      .eq('keyword', keyword)
      .eq('geo', geo);

    if (error) {
      console.error('Error clearing SERP cache:', error);
      return false;
    }

    console.log(`Cache cleared for ${keyword} in ${geo}`);
    return true;
  } catch (error) {
    console.error('Error clearing SERP cache:', error);
    return false;
  }
};
