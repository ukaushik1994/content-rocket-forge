
import { SerpAnalysisResult, PeopleAlsoAskQuestion, SerpSearchParams, FeaturedSnippet } from '@/types/serp';
import { supabase } from '@/integrations/supabase/client';
import { getApiKey } from '@/services/apiKeyService';
import { serpResultsCache } from '@/utils/cacheUtils';
import { toast } from 'sonner';

/**
 * Enhanced SERP API service with better error handling and real data processing
 */

const generateMockSerpData = (keyword: string): SerpAnalysisResult => {
  console.log('📝 Generating mock SERP data for keyword:', keyword);
  
  return {
    keyword,
    keywords: [
      `${keyword} guide`,
      `best ${keyword}`,
      `${keyword} tips`,
      `how to ${keyword}`,
      `${keyword} examples`,
      `${keyword} tutorial`,
      `${keyword} review`,
      `${keyword} comparison`
    ],
    headings: [
      { text: `Complete Guide to ${keyword}`, level: 'h1' },
      { text: `Understanding ${keyword}: A Beginner's Approach`, level: 'h2' },
      { text: `Advanced ${keyword} Techniques`, level: 'h2' },
      { text: `Common ${keyword} Mistakes to Avoid`, level: 'h3' },
      { text: `Best Practices for ${keyword}`, level: 'h3' },
      { text: `${keyword} vs Alternatives`, level: 'h2' }
    ],
    peopleAlsoAsk: [
      { question: `What is ${keyword}?`, source: 'mock', answer: `${keyword} is a comprehensive topic that requires understanding.` },
      { question: `How does ${keyword} work?`, source: 'mock', answer: `${keyword} works through various mechanisms and processes.` },
      { question: `Why is ${keyword} important?`, source: 'mock', answer: `${keyword} is important for many reasons in today's context.` },
      { question: `When should you use ${keyword}?`, source: 'mock', answer: `${keyword} should be used in specific situations and contexts.` },
      { question: `Where can I learn more about ${keyword}?`, source: 'mock', answer: `You can learn more about ${keyword} from various sources.` }
    ],
    featuredSnippets: [
      {
        type: 'paragraph',
        content: `${keyword} is an essential concept that helps businesses and individuals achieve their goals through strategic implementation.`,
        source: 'example.com',
        title: `What is ${keyword}?`
      }
    ],
    entities: [
      { name: keyword, type: 'primary_topic', importance: 1 },
      { name: `${keyword} tools`, type: 'related_concept', importance: 0.8 },
      { name: `${keyword} methods`, type: 'related_concept', importance: 0.7 }
    ],
    contentGaps: [
      { topic: `Detailed ${keyword} implementation guide`, description: `A comprehensive guide covering ${keyword} implementation`, recommendation: 'Create step-by-step tutorial' },
      { topic: `${keyword} case studies and examples`, description: `Real-world examples and case studies`, recommendation: 'Include practical examples' },
      { topic: `Troubleshooting common ${keyword} issues`, description: `Common problems and solutions`, recommendation: 'Add troubleshooting section' }
    ],
    topResults: [
      {
        title: `Ultimate ${keyword} Guide`,
        link: `https://example.com/${keyword}-guide`,
        snippet: `Comprehensive guide covering everything about ${keyword}`,
        position: 1
      }
    ],
    relatedSearches: [
      { query: `${keyword} tutorial` },
      { query: `${keyword} examples` },
      { query: `${keyword} best practices` }
    ],
    isMockData: true
  };
};

const processSerpApiResponse = (data: any, keyword: string): SerpAnalysisResult | null => {
  try {
    console.log('🔍 Processing real SERP API response for keyword:', keyword);
    console.log('📊 Raw SERP data structure:', Object.keys(data));
    
    if (!data) {
      console.warn('⚠️ No data received from SERP API');
      return null;
    }

    // Extract organic results
    const organicResults = data.organic_results || [];
    console.log('📄 Found organic results:', organicResults.length);

    // Extract related searches
    const relatedSearches = (data.related_searches || []).map((search: any) => ({
      query: search.query || search.link?.split('q=')[1]?.split('&')[0] || 'Unknown query'
    })).filter((search: any) => search.query && search.query !== 'Unknown query');
    
    console.log('🔗 Found related searches:', relatedSearches.length);

    // Extract People Also Ask questions from related_questions
    const peopleAlsoAsk: PeopleAlsoAskQuestion[] = (data.related_questions || []).map((item: any) => ({
      question: item.question || 'Unknown question',
      source: item.link || 'Unknown source',
      answer: item.snippet || item.answer || undefined
    })).filter((item: any) => item.question && item.question !== 'Unknown question');
    
    console.log('❓ Found People Also Ask from related_questions:', peopleAlsoAsk.length);

    // Extract featured snippets from various sources
    const featuredSnippets: FeaturedSnippet[] = [];
    
    // Check for answer box
    if (data.answer_box) {
      featuredSnippets.push({
        type: 'paragraph',
        content: data.answer_box.answer || data.answer_box.snippet || '',
        source: data.answer_box.link || 'Unknown source',
        title: data.answer_box.title || 'Featured Snippet'
      });
    }
    
    // Check for featured snippet in organic results
    organicResults.forEach((result: any) => {
      if (result.rich_snippet || result.snippet_highlighted_words) {
        featuredSnippets.push({
          type: 'paragraph',
          content: result.snippet || '',
          source: result.link || '',
          title: result.title || 'Organic Result Snippet'
        });
      }
    });
    
    console.log('📝 Found featured snippets:', featuredSnippets.length);

    // Extract headings from organic results
    const headings: { text: string; level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; subtext?: string; type?: string; }[] = [];
    organicResults.forEach((result: any) => {
      if (result.title) {
        headings.push({ text: result.title, level: 'h1' });
      }
      if (result.sitelinks) {
        result.sitelinks.forEach((sitelink: any) => {
          if (sitelink.title) {
            headings.push({ text: sitelink.title, level: 'h2' });
          }
        });
      }
    });
    
    console.log('📋 Extracted headings:', headings.length);

    // Extract keywords from various sources
    const keywords = new Set<string>();
    
    // From related searches
    relatedSearches.forEach((search: any) => {
      if (search.query) {
        keywords.add(search.query);
      }
    });
    
    // From organic result titles
    organicResults.forEach((result: any) => {
      if (result.title) {
        // Extract meaningful keywords from titles
        const titleWords = result.title.toLowerCase()
          .split(/[^a-zA-Z0-9\s]/)
          .join(' ')
          .split(/\s+/)
          .filter((word: string) => word.length > 3);
        
        titleWords.forEach((word: string) => {
          if (word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word)) {
            keywords.add(word);
          }
        });
      }
    });

    console.log('🏷️ Extracted keywords:', keywords.size);

    // Extract entities
    const entities: any[] = [];
    
    // From knowledge graph if available
    if (data.knowledge_graph) {
      entities.push({
        name: data.knowledge_graph.title || keyword,
        type: 'knowledge_graph',
        importance: 1,
        description: data.knowledge_graph.description
      });
      
      // Add related entities from knowledge graph
      if (data.knowledge_graph.related_entities) {
        data.knowledge_graph.related_entities.forEach((entity: any) => {
          entities.push({
            name: entity.name || entity.title,
            type: 'related_entity',
            importance: 0.7
          });
        });
      }
    }

    // From answer box/featured snippets
    if (data.answer_box) {
      entities.push({
        name: data.answer_box.title || keyword,
        type: 'featured_content',
        importance: 0.9,
        description: data.answer_box.snippet || data.answer_box.answer
      });
    }

    console.log('🎯 Extracted entities:', entities.length);

    // Process top results
    const topResults = organicResults.slice(0, 10).map((result: any, index: number) => ({
      title: result.title || 'Untitled',
      link: result.link || '',
      snippet: result.snippet || '',
      position: result.position || index + 1
    }));

    console.log('🏆 Processed top results:', topResults.length);

    // Generate content gaps based on what's missing
    const contentGaps: { topic: string; description: string; recommendation?: string; content?: string; opportunity?: string; source?: string; }[] = [];
    
    if (peopleAlsoAsk.length === 0) {
      contentGaps.push({
        topic: `FAQ section about ${keyword}`,
        description: `Create frequently asked questions section`,
        recommendation: 'Add comprehensive FAQ'
      });
    }
    
    if (entities.length < 3) {
      contentGaps.push({
        topic: `Detailed explanation of ${keyword} concepts`,
        description: `Expand on core concepts and terminology`,
        recommendation: 'Include detailed explanations'
      });
    }
    
    if (headings.length < 5) {
      contentGaps.push({
        topic: `Comprehensive ${keyword} structure and organization`,
        description: `Improve content structure and organization`,
        recommendation: 'Add more sections and subsections'
      });
    }
    
    contentGaps.push({
      topic: `Practical examples and case studies for ${keyword}`,
      description: `Real-world applications and examples`,
      recommendation: 'Include case studies'
    });
    
    contentGaps.push({
      topic: `Advanced techniques and best practices for ${keyword}`,
      description: `Expert-level tips and advanced strategies`,
      recommendation: 'Add advanced techniques section'
    });

    console.log('🔍 Generated content gaps:', contentGaps.length);

    const result: SerpAnalysisResult = {
      keyword,
      keywords: Array.from(keywords).slice(0, 20), // Limit to top 20
      headings: headings.slice(0, 15), // Limit to top 15
      peopleAlsoAsk,
      featuredSnippets,
      entities,
      contentGaps,
      topResults,
      relatedSearches,
      isMockData: false
    };

    console.log('✅ Successfully processed SERP data:', {
      keyword: result.keyword,
      keywords: result.keywords.length,
      headings: result.headings.length,
      peopleAlsoAsk: result.peopleAlsoAsk.length,
      featuredSnippets: result.featuredSnippets?.length || 0,
      entities: result.entities.length,
      contentGaps: result.contentGaps.length,
      topResults: result.topResults.length,
      relatedSearches: result.relatedSearches.length
    });

    return result;
    
  } catch (error) {
    console.error('❌ Error processing SERP API response:', error);
    return null;
  }
};

export const analyzeKeywordSerp = async (
  keyword: string, 
  forceRefresh: boolean = false
): Promise<SerpAnalysisResult | null> => {
  try {
    console.log('🚀 Starting SERP analysis for keyword:', keyword, { forceRefresh });
    
    if (!keyword?.trim()) {
      console.warn('⚠️ No keyword provided for SERP analysis');
      return null;
    }

    // Try to get API key
    let apiKey: string | null = null;
    try {
      apiKey = await getApiKey('serp');
      console.log('🔑 API key retrieved:', apiKey ? `${apiKey.substring(0, 8)}...` : 'none');
    } catch (error) {
      console.warn('⚠️ Failed to get API key:', error);
    }

    // Check cache first (unless force refresh)
    const cacheKey = `serp_${keyword.toLowerCase().replace(/\s+/g, '_')}`;
    if (!forceRefresh) {
      const cached = serpResultsCache.get(cacheKey, apiKey || undefined);
      if (cached) {
        console.log('💾 Returning cached SERP data for:', keyword);
        return cached;
      }
    } else {
      // Clear cache for this keyword if force refresh
      serpResultsCache.delete(cacheKey);
      console.log('🗑️ Cleared cache for keyword:', keyword);
    }

    if (!apiKey) {
      console.log('📝 No API key available, returning mock data');
      const mockData = generateMockSerpData(keyword);
      // Don't cache mock data with API key
      serpResultsCache.set(cacheKey, mockData);
      return mockData;
    }

    // Make API call through edge function
    console.log('📡 Making SERP API call through edge function');
    
    const { data, error } = await supabase.functions.invoke('serp-api', {
      body: {
        endpoint: 'search',
        params: {
          q: keyword,
          num: 10,
          gl: 'us',
          hl: 'en'
        },
        apiKey
      }
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      throw new Error(`SERP API error: ${error.message}`);
    }

    if (!data) {
      console.error('❌ No data returned from edge function');
      throw new Error('No data returned from SERP API');
    }

    if (data.error) {
      console.error('❌ SERP API returned error:', data.error);
      throw new Error(`SERP API error: ${data.error}`);
    }

    console.log('✅ Successfully received SERP data from edge function');

    // Process the real API response
    const processedData = processSerpApiResponse(data, keyword);
    
    if (!processedData) {
      console.warn('⚠️ Failed to process SERP data, falling back to mock');
      const mockData = generateMockSerpData(keyword);
      serpResultsCache.set(cacheKey, mockData);
      return mockData;
    }

    // Cache the processed data with API key hash
    serpResultsCache.set(cacheKey, processedData, apiKey);
    console.log('💾 Cached processed SERP data for keyword:', keyword);
    
    return processedData;

  } catch (error) {
    console.error('💥 Error in analyzeKeywordSerp:', error);
    
    // Return mock data as fallback
    console.log('🔄 Falling back to mock data due to error');
    const mockData = generateMockSerpData(keyword);
    
    // Don't cache mock data when there was an error, so we can retry later
    return mockData;
  }
};

export const searchKeywords = async (params: SerpSearchParams): Promise<any[]> => {
  try {
    console.log('🔍 Searching keywords with params:', params);
    
    // Try to get API key
    let apiKey: string | null = null;
    try {
      apiKey = await getApiKey('serp');
    } catch (error) {
      console.warn('⚠️ Failed to get API key for keyword search:', error);
    }

    if (!apiKey) {
      console.log('📝 No API key available, returning mock search results');
      // Return mock search results
      return [
        { title: `Best ${params.query} Guide`, link: `https://example.com/${params.query}` },
        { title: `How to Use ${params.query}`, link: `https://example.com/how-to-${params.query}` },
        { title: `${params.query} Tutorial`, link: `https://example.com/${params.query}-tutorial` },
        { title: `Advanced ${params.query}`, link: `https://example.com/advanced-${params.query}` },
        { title: `${params.query} Tips and Tricks`, link: `https://example.com/${params.query}-tips` }
      ];
    }

    // Make API call through edge function
    const { data, error } = await supabase.functions.invoke('serp-api', {
      body: {
        endpoint: 'search',
        params: {
          q: params.query,
          num: params.limit || 10,
          gl: 'us',
          hl: 'en'
        },
        apiKey
      }
    });

    if (error) {
      console.error('❌ Error in searchKeywords:', error);
      throw new Error(`Search error: ${error.message}`);
    }

    if (!data || !data.organic_results) {
      console.warn('⚠️ No search results returned');
      return [];
    }

    // Return the organic results
    return data.organic_results || [];

  } catch (error) {
    console.error('💥 Error in searchKeywords:', error);
    
    // Return mock data as fallback
    return [
      { title: `Best ${params.query} Guide`, link: `https://example.com/${params.query}` },
      { title: `How to Use ${params.query}`, link: `https://example.com/how-to-${params.query}` },
      { title: `${params.query} Tutorial`, link: `https://example.com/${params.query}-tutorial` }
    ];
  }
};

// Export the types and interfaces needed by other modules
export type { SerpAnalysisResult, PeopleAlsoAskQuestion, SerpSearchParams };
