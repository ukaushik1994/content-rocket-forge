
import { supabase } from '@/integrations/supabase/client';
import { getApiKey } from '@/services/apiKeyService';

export interface EnhancedSerpResult {
  keyword: string;
  searchVolume: number;
  keywordDifficulty: number;
  competitionScore: number;
  
  // 9 Main SERP Sections
  keywords: string[];
  contentGaps: Array<{
    topic: string;
    description: string;
    opportunity: string;
    source: string;
  }>;
  questions: Array<{
    question: string;
    answer?: string;
    source: string;
  }>;
  featuredSnippets: Array<{
    type: string;
    content: string;
    source: string;
    title: string;
  }>;
  topStories: Array<{
    title: string;
    source: string;
    date: string;
    url: string;
  }>;
  multimedia: {
    images: Array<{
      title: string;
      source: string;
      thumbnail?: string;
    }>;
    videos: Array<{
      title: string;
      source: string;
      duration?: string;
      thumbnail?: string;
    }>;
  };
  entities: Array<{
    name: string;
    type: string;
    description?: string;
    source: string;
  }>;
  headings: Array<{
    text: string;
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    source: string;
    subtext?: string;
  }>;
  knowledgeGraph: {
    title?: string;
    type?: string;
    description?: string;
    attributes: Record<string, any>;
    relatedEntities: Array<{
      name: string;
      link?: string;
    }>;
  };
  
  // Additional properties expected by components
  metrics: {
    search_volume: number;
    seo_difficulty: number;
    opportunity_score: number;
    competition_pct: number;
    result_count: number;
  };
  
  serp_blocks: {
    organic: Array<{
      title: string;
      link: string;
      snippet?: string;
    }>;
    ads: Array<{
      title: string;
      link: string;
      description: string;
    }>;
    people_also_ask: Array<{
      question: string;
      answer?: string;
    }>;
    images: Array<{
      title: string;
      thumbnail?: string;
    }>;
    videos: Array<{
      title: string;
      link: string;
      description?: string;
      duration?: string;
    }>;
    knowledge_graph?: {
      title?: string;
      description?: string;
      attributes?: Record<string, any>;
    };
  };
  
  insights: string[];
  data_sources: {
    is_cached: boolean;
    volume_api: boolean;
    serp_api: boolean;
  };
  related_keywords: Array<{
    title: string;
    volume?: number;
  }>;
  
  // Metadata
  dataQuality: string;
  isMockData: boolean;
  recommendations: string[];
}

/**
 * Enhanced retry logic with exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on authentication or quota errors
      if (error instanceof Error && (
        error.message.includes('Invalid API key') ||
        error.message.includes('quota') ||
        error.message.includes('limit')
      )) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`⏳ Retry attempt ${attempt}/${maxRetries} in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Analyze keyword using enhanced SERP API with comprehensive data extraction and error resilience
 */
export async function analyzeKeywordEnhanced(
  keyword: string,
  location: string = 'us',
  forceRefresh: boolean = false
): Promise<EnhancedSerpResult | null> {
  return await retryWithBackoff(async () => {
    console.log(`🔍 Enhanced SERP analysis for keyword: ${keyword}`);
    
    // Check cache first (if not forcing refresh)
    if (!forceRefresh) {
      try {
        const { data: cachedData } = await supabase
          .from('serp_cache')
          .select('payload, created_at')
          .eq('keyword', keyword)
          .eq('geo', location)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24h cache
          .maybeSingle();
        
        if (cachedData && cachedData.payload) {
          console.log('✅ Using cached enhanced SERP data');
          return cachedData.payload as unknown as EnhancedSerpResult;
        }
      } catch (cacheError) {
        console.warn('⚠️ Cache lookup failed, proceeding with fresh analysis:', cacheError);
      }
    }
    
    // Get API key for SERP analysis with fallback
    console.log('🔑 Retrieving SERP API key...');
    const apiKey = await getApiKey('serp');
    
    if (!apiKey) {
      console.error('❌ No SERP API key configured');
      throw new Error('SERP API key not configured. Please add your SerpAPI key in the settings.');
    }
    
    console.log('✅ SERP API key retrieved successfully');
    
    // Make API call to enhanced SERP function with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('SERP API request timeout')), 30000)
    );
    
    const apiPromise = supabase.functions.invoke('serp-api', {
      body: {
        endpoint: 'analyze',
        apiKey: apiKey,
        params: {
          q: keyword, // SerpAPI expects 'q' parameter
          location: location,
          num: 10,
          device: 'desktop',
          engine: 'google'
        }
      }
    });
    
    const { data, error } = await Promise.race([apiPromise, timeoutPromise]) as any;
    
    if (error) {
      console.error('Enhanced SERP API error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Invalid API key')) {
        throw new Error('Invalid SERP API key. Please check your API key configuration.');
      } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
        throw new Error('SERP API quota exceeded. Please check your API usage.');
      } else if (error.message?.includes('timeout')) {
        throw new Error('SERP API request timed out. Please try again.');
      } else {
        throw new Error(`SERP API error: ${error.message || 'Unknown error'}`);
      }
    }
    
    if (!data) {
      console.warn('No data received from enhanced SERP API');
      throw new Error('No data received from SERP API. Please try again.');
    }
    
    // Cache the result
    try {
      await supabase
        .from('serp_cache')
        .upsert({
          keyword,
          geo: location,
          payload: data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (cacheError) {
      console.warn('⚠️ Failed to cache SERP data:', cacheError);
    }

    console.log('✅ Enhanced SERP analysis complete');
    return data as EnhancedSerpResult;
  });
}

/**
 * Get section-specific data from enhanced SERP result
 */
export function getSerpSection(data: EnhancedSerpResult, section: string): any[] {
  switch (section) {
    case 'keywords':
      return data.keywords.map(keyword => ({ content: keyword, type: 'keyword' }));
    case 'contentGaps':
      return data.contentGaps.map(gap => ({ content: gap.topic, type: 'contentGap', metadata: gap }));
    case 'questions':
      return data.questions.map(q => ({ content: q.question, type: 'question', metadata: q }));
    case 'featuredSnippets':
      return data.featuredSnippets.map(snippet => ({ content: snippet.title, type: 'snippet', metadata: snippet }));
    case 'topStories':
      return data.topStories.map(story => ({ content: story.title, type: 'topStory', metadata: story }));
    case 'multimedia':
      return [
        ...data.multimedia.images.map(img => ({ content: img.title, type: 'image', metadata: img })),
        ...data.multimedia.videos.map(video => ({ content: video.title, type: 'video', metadata: video }))
      ];
    case 'entities':
      return data.entities.map(entity => ({ content: entity.name, type: 'entity', metadata: entity }));
    case 'headings':
      return data.headings.map(heading => ({ content: heading.text, type: 'heading', metadata: heading }));
    case 'knowledgeGraph':
      return data.knowledgeGraph.title ? [{ content: data.knowledgeGraph.title, type: 'knowledgeEntity', metadata: data.knowledgeGraph }] : [];
    default:
      return [];
  }
}

// Create a service object for backward compatibility
export const enhancedSerpService = {
  analyzeKeywordEnhanced,
  getSerpSection
};
