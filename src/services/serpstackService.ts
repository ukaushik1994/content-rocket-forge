import { callApiProxy } from './apiProxyService';
import { SerpAnalysisResult } from '@/types/serp';
import { toast } from 'sonner';

/**
 * Enhanced Serpstack keyword analysis with comprehensive data extraction
 */
export async function analyzeSerpstackKeyword(keyword: string): Promise<SerpAnalysisResult | null> {
  try {
    console.log(`🎯 Analyzing keyword with enhanced Serpstack: "${keyword}"`);
    
    const result = await callApiProxy('serpstack', 'analyze', { 
      keyword, 
      q: keyword,
      refresh: true 
    });
    
    if (result && result.isGoogleData) {
      console.log('✅ Enhanced Serpstack analysis completed with comprehensive data');
      
      // Log what Serpstack can show
      const capabilities = {
        peopleAlsoAsk: result.peopleAlsoAsk?.length || 0,
        featuredSnippets: result.featuredSnippets?.length || 0,
        entities: result.entities?.length || 0,
        headings: result.headings?.length || 0,
        contentGaps: result.contentGaps?.length || 0,
        topResults: result.topResults?.length || 0,
        relatedSearches: result.relatedSearches?.length || 0,
        keywords: result.keywords?.length || 0
      };
      
      console.log('📊 Serpstack API Capabilities Demonstrated:', capabilities);
      
      toast.success(`Serpstack extracted ${capabilities.peopleAlsoAsk} FAQs, ${capabilities.entities} entities, and ${capabilities.topResults} competitor insights!`, {
        duration: 6000
      });
      
      return result;
    } else {
      console.warn('⚠️ Serpstack returned empty or invalid data');
      toast.error('Serpstack API returned no data. Please check your API key and try again.');
      return null;
    }
  } catch (error: any) {
    console.error('💥 Enhanced Serpstack analysis failed:', error);
    toast.error(`Serpstack analysis failed: ${error.message}`);
    return null;
  }
}

/**
 * Test Serpstack API connection and show capabilities
 */
export async function testSerpstackConnection(): Promise<boolean> {
  try {
    const result = await callApiProxy('serpstack', 'test');
    
    if (result && result.success) {
      console.log('✅ Serpstack connection test successful');
      
      // Show what Serpstack can provide
      const capabilities = [
        '🔍 Organic search results with positions',
        '❓ People Also Ask questions and answers',
        '📝 Featured snippets and answer boxes',
        '🧠 Knowledge graph data',
        '🏪 Local and shopping results',
        '🔗 Related searches and keywords',
        '📊 Search volume estimates',
        '🎯 Competitor analysis',
        '💡 Content gap identification',
        '📋 Smart heading suggestions'
      ];
      
      toast.success(`Serpstack API connected! Capabilities:\n${capabilities.join('\n')}`, {
        duration: 8000
      });
      
      return true;
    } else {
      toast.error('Serpstack connection failed');
      return false;
    }
  } catch (error: any) {
    console.error('Serpstack test failed:', error);
    toast.error(`Serpstack test failed: ${error.message}`);
    return false;
  }
}

/**
 * Search with Serpstack and show what data is available
 */
export async function searchSerpstack(query: string, limit = 10) {
  try {
    console.log(`🔍 Searching with Serpstack: "${query}"`);
    
    const result = await callApiProxy('serpstack', 'search', { 
      q: query, 
      keyword: query,
      limit 
    });
    
    if (result) {
      console.log('✅ Serpstack search completed');
      
      // Log search capabilities
      const searchData = {
        totalResults: result.search_information?.total_results || 0,
        organicResults: result.organic_results?.length || 0,
        relatedSearches: result.related_searches?.length || 0,
        hasAnswerBox: !!result.answer_box,
        hasKnowledgeGraph: !!result.knowledge_graph,
        hasLocalResults: !!result.local_results,
        hasPeopleAlsoAsk: !!result.people_also_ask || !!result.related_questions
      };
      
      console.log('📊 Serpstack Search Data Available:', searchData);
      
      return result;
    } else {
      console.warn('⚠️ No Serpstack search results found');
      return null;
    }
  } catch (error: any) {
    console.error('💥 Serpstack search failed:', error);
    toast.error(`Serpstack search failed: ${error.message}`);
    return null;
  }
}