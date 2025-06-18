
import { supabase } from '@/integrations/supabase/client';
import { ContentBuilderState, ContentBuilderAction } from '../types/index';

export const createSerpActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const analyzeKeyword = async (keyword: string): Promise<void> => {
    if (!keyword.trim()) return;

    dispatch({
      type: 'SET_ANALYZING',
      payload: true
    });

    try {
      console.log(`🔍 Starting enhanced SERP analysis for keyword: "${keyword}"`);

      // Call the updated keyword-serp edge function
      const { data, error } = await supabase.functions.invoke('keyword-serp', {
        body: JSON.stringify({
          keyword: keyword.trim(),
          geo: 'US',
          forceRefresh: false
        }),
      });

      if (error) {
        console.error('❌ SERP analysis error:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('❌ SERP analysis failed:', data?.error);
        throw new Error(data?.error || 'SERP analysis failed');
      }

      const analysisResult = data.data;
      console.log('✅ SERP analysis completed:', {
        keyword,
        searchVolume: analysisResult.metrics?.search_volume || 0,
        organicResults: analysisResult.serp_blocks?.organic?.length || 0,
        relatedKeywords: analysisResult.related_keywords?.length || 0,
        cached: data.cached
      });

      // Transform the structured response to match existing format
      const transformedData = {
        keyword: analysisResult.keyword,
        searchVolume: analysisResult.metrics?.search_volume || 0,
        competitionScore: analysisResult.metrics?.competition_pct || 0,
        keywordDifficulty: analysisResult.metrics?.seo_difficulty || 0,
        
        // SERP blocks
        topResults: (analysisResult.serp_blocks?.organic || []).slice(0, 10).map((result: any, index: number) => ({
          title: result.title || '',
          link: result.link || result.url || '',
          snippet: result.snippet || result.description || '',
          position: result.position || index + 1
        })),
        
        relatedSearches: (analysisResult.related_keywords || []).map((keyword: string, index: number) => ({
          query: keyword,
          volume: null // Volume data not available for related keywords
        })),
        
        peopleAlsoAsk: (analysisResult.serp_blocks?.people_also_ask || []).map((item: any) => ({
          question: item.question || item.title || '',
          source: item.source || item.link || '',
          answer: item.snippet || item.answer || ''
        })),
        
        // Enhanced fields for SERP analysis
        entities: extractEntities(analysisResult),
        headings: extractHeadings(analysisResult),
        contentGaps: generateContentGaps(analysisResult),
        
        // New enhanced fields
        knowledgeGraph: analysisResult.serp_blocks?.knowledge_graph || null,
        localResults: analysisResult.serp_blocks?.local_results || [],
        topStories: analysisResult.serp_blocks?.top_stories || [],
        images: analysisResult.serp_blocks?.images || [],
        videos: analysisResult.serp_blocks?.videos || [],
        
        // Additional data
        ads: analysisResult.serp_blocks?.ads || [],
        metrics: analysisResult.metrics,
        timestamp: analysisResult.timestamp,
        dataSources: analysisResult.data_sources,
        
        // Debug information
        debugInfo: {
          rawDataStructure: Object.keys(analysisResult),
          dataPresence: {
            hasMetrics: !!analysisResult.metrics,
            hasSerpBlocks: !!analysisResult.serp_blocks,
            hasRelatedKeywords: !!(analysisResult.related_keywords?.length),
            hasOrganic: !!(analysisResult.serp_blocks?.organic?.length),
            hasAds: !!(analysisResult.serp_blocks?.ads?.length)
          }
        }
      };

      // Update state with transformed data
      dispatch({
        type: 'SET_SERP_DATA',
        payload: transformedData
      });

      // Add related keywords to selected keywords
      const relatedKeywords = analysisResult.related_keywords || [];
      relatedKeywords.slice(0, 5).forEach((relatedKeyword: string) => {
        if (!state.selectedKeywords.includes(relatedKeyword)) {
          dispatch({
            type: 'ADD_KEYWORD',
            payload: relatedKeyword
          });
        }
      });

    } catch (error: any) {
      console.error('💥 Error in SERP analysis:', error);
      
      // Show user-friendly error message
      dispatch({
        type: 'SET_SERP_DATA',
        payload: {
          keyword,
          error: error.message || 'Failed to analyze keyword',
          searchVolume: 0,
          topResults: [],
          relatedSearches: [],
          peopleAlsoAsk: [],
          entities: [],
          headings: [],
          contentGaps: []
        }
      });
    } finally {
      dispatch({
        type: 'SET_ANALYZING',
        payload: false
      });
    }
  };

  const addContentFromSerp = (content: string, type: string): void => {
    dispatch({
      type: 'TOGGLE_SERP_SELECTION',
      payload: { type, content }
    });
  };

  const generateOutlineFromSelections = (): void => {
    const { serpSelections } = state;
    
    if (serpSelections.length === 0) {
      console.warn('No SERP selections to generate outline from');
      return;
    }

    // Group selections by type
    const groupedSelections = serpSelections.reduce((acc: any, selection) => {
      if (!acc[selection.type]) {
        acc[selection.type] = [];
      }
      acc[selection.type].push(selection.content);
      return acc;
    }, {});

    // Generate outline sections based on selections
    const outlineSections = [];

    // Add introduction if we have knowledge graph or entities
    if (groupedSelections.entities || groupedSelections.knowledge_graph) {
      outlineSections.push({
        id: 'introduction',
        title: 'Introduction',
        description: `Introduction to ${state.mainKeyword}`,
        content: groupedSelections.entities?.[0] || groupedSelections.knowledge_graph?.[0] || '',
        order: 1
      });
    }

    // Add main sections from questions
    if (groupedSelections.questions) {
      groupedSelections.questions.forEach((question: string, index: number) => {
        outlineSections.push({
          id: `section-${index + 1}`,
          title: question.replace('?', ''),
          description: `Detailed explanation of ${question.toLowerCase()}`,
          content: question,
          order: index + 2
        });
      });
    }

    // Add sections from headings
    if (groupedSelections.headings) {
      groupedSelections.headings.forEach((heading: string, index: number) => {
        outlineSections.push({
          id: `heading-${index + 1}`,
          title: heading,
          description: `Content section covering ${heading.toLowerCase()}`,
          content: heading,
          order: outlineSections.length + 1
        });
      });
    }

    // Add conclusion section
    outlineSections.push({
      id: 'conclusion',
      title: 'Conclusion',
      description: `Summary and key takeaways about ${state.mainKeyword}`,
      content: `Conclusion and final thoughts on ${state.mainKeyword}`,
      order: outlineSections.length + 1
    });

    dispatch({
      type: 'SET_OUTLINE_SECTIONS',
      payload: outlineSections
    });

    console.log('✅ Generated outline from SERP selections:', outlineSections.length, 'sections');
  };

  return {
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections
  };
};

// Helper functions to extract data from the new SERP response format
const extractEntities = (data: any) => {
  const entities = [];
  
  // Extract from knowledge graph
  if (data.serp_blocks?.knowledge_graph?.title) {
    entities.push({
      name: data.serp_blocks.knowledge_graph.title,
      type: 'main_entity',
      importance: 1,
      description: data.serp_blocks.knowledge_graph.description || '',
      source: 'knowledge_graph'
    });
  }
  
  // Extract from organic results titles
  (data.serp_blocks?.organic || []).slice(0, 3).forEach((result: any, index: number) => {
    if (result.title) {
      entities.push({
        name: result.title.split(' - ')[0] || result.title,
        type: 'topic',
        importance: 1 - (index * 0.2),
        description: result.snippet || '',
        source: 'organic_results'
      });
    }
  });
  
  return entities;
};

const extractHeadings = (data: any) => {
  const headings = [];
  
  // Extract from People Also Ask questions
  (data.serp_blocks?.people_also_ask || []).forEach((item: any) => {
    if (item.question) {
      headings.push({
        text: item.question,
        level: 'h2' as const,
        subtext: item.snippet || '',
        type: 'question'
      });
    }
  });
  
  // Extract from organic results as potential headings
  (data.serp_blocks?.organic || []).slice(0, 5).forEach((result: any) => {
    if (result.title) {
      headings.push({
        text: result.title.split(' - ')[0] || result.title,
        level: 'h3' as const,
        subtext: result.snippet || '',
        type: 'topic'
      });
    }
  });
  
  return headings;
};

const generateContentGaps = (data: any) => {
  const gaps = [];
  
  // Analyze what's missing based on SERP features
  if (!data.serp_blocks?.knowledge_graph && data.metrics?.search_volume > 1000) {
    gaps.push({
      topic: 'Definition and Overview',
      description: 'No knowledge graph found - opportunity for comprehensive definition',
      recommendation: 'Create a clear, authoritative definition section',
      opportunity: 'Featured snippet opportunity',
      source: 'analysis'
    });
  }
  
  if ((data.serp_blocks?.people_also_ask || []).length > 3) {
    gaps.push({
      topic: 'Frequently Asked Questions',
      description: 'Multiple related questions show user interest in FAQ format',
      recommendation: 'Include a comprehensive FAQ section',
      opportunity: 'People Also Ask optimization',
      source: 'serp_analysis'
    });
  }
  
  if ((data.serp_blocks?.images || []).length > 0) {
    gaps.push({
      topic: 'Visual Content',
      description: 'Image results suggest visual content opportunities',
      recommendation: 'Include relevant images, infographics, or visual aids',
      opportunity: 'Image search visibility',
      source: 'serp_analysis'
    });
  }
  
  return gaps;
};
