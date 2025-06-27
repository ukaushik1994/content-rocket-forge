
import { supabase } from '@/integrations/supabase/client';

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
 * Analyze keyword using enhanced SERP API with comprehensive data extraction
 */
export async function analyzeKeywordEnhanced(
  keyword: string,
  location: string = 'us',
  forceRefresh: boolean = false
): Promise<EnhancedSerpResult | null> {
  try {
    console.log(`🔍 Enhanced SERP analysis for keyword: ${keyword}`);
    
    // Check cache first (if not forcing refresh)
    if (!forceRefresh) {
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
    }
    
    // Make API call to enhanced SERP function
    const { data, error } = await supabase.functions.invoke('serp-api', {
      body: JSON.stringify({
        endpoint: 'analyze',
        params: {
          keyword,
          location,
          num: 10,
          device: 'desktop'
        }
      })
    });
    
    if (error) {
      console.error('Enhanced SERP API error:', error);
      return null;
    }
    
    if (!data) {
      console.warn('No data received from enhanced SERP API');
      return null;
    }
    
    // Cache the result
    await supabase
      .from('serp_cache')
      .upsert({
        keyword,
        geo: location,
        payload: data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    console.log('✅ Enhanced SERP analysis complete');
    return data as EnhancedSerpResult;
    
  } catch (error) {
    console.error('Error in enhanced SERP analysis:', error);
    return null;
  }
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
