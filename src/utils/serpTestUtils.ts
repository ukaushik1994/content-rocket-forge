import { supabase } from "@/integrations/supabase/client";

/**
 * Test the SERP integration end-to-end
 */
export async function testSerpIntegration(keyword: string = "digital marketing") {
  console.log('🧪 Testing SERP Integration...');
  
  try {
    // Test 1: Direct edge function call
    console.log('📡 Testing direct SERP-AI edge function call...');
    const { data: serpData, error: serpError } = await supabase.functions.invoke('serp-ai', {
      body: {
        keyword,
        location: 'United States',
        language: 'en'
      }
    });

    if (serpError) {
      console.error('❌ SERP Edge Function Error:', serpError);
      return { success: false, error: serpError };
    }

    console.log('✅ SERP Edge Function Response:', serpData);

    // Test 2: Check if data was cached
    console.log('🗄️ Checking SERP cache...');
    const { data: cacheData, error: cacheError } = await supabase
      .from('serp_cache')
      .select('*')
      .eq('keyword', keyword.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1);

    if (cacheError) {
      console.warn('⚠️ Cache check failed:', cacheError);
    } else {
      console.log('📊 Cache Data:', cacheData);
    }

    // Test 3: Test predictive analysis
    console.log('🔮 Testing predictive analysis...');
    const { data: predictiveData, error: predictiveError } = await supabase.functions.invoke('serp-ai', {
      body: {
        keywords: [keyword],
        userId: 'test-user',
        endpoint: 'predictive-analysis'
      }
    });

    if (predictiveError) {
      console.warn('⚠️ Predictive analysis failed:', predictiveError);
    } else {
      console.log('🔮 Predictive Analysis:', predictiveData);
    }

    return {
      success: true,
      results: {
        serpData,
        cacheData,
        predictiveData
      }
    };

  } catch (error) {
    console.error('❌ SERP Integration Test Failed:', error);
    return { success: false, error };
  }
}

/**
 * Test smart suggestions data flow
 */
export async function testSmartSuggestionsFlow(userId: string, keyword: string = "content strategy") {
  console.log('🧠 Testing Smart Suggestions Flow...');
  
  try {
    // Simulate SERP data for suggestions
    const mockSerpData = {
      keyword,
      searchVolume: 12000,
      keywordDifficulty: 45,
      contentGaps: [
        { topic: `${keyword} for beginners`, opportunity: 'Create beginner guide' },
        { topic: `Advanced ${keyword} techniques`, opportunity: 'Develop advanced tutorial' }
      ],
      questions: [
        { question: `What is ${keyword}?`, answer: `${keyword} is...` },
        { question: `How to implement ${keyword}?`, answer: `To implement ${keyword}...` }
      ],
      topResults: [
        { position: 1, title: `Top ${keyword} Guide`, url: 'https://example.com' }
      ]
    };

    // Save to conversation context
    const { error: contextError } = await supabase
      .from('serp_conversation_context')
      .insert({
        user_id: userId,
        context_type: 'smart_suggestions_test',
        keywords: [keyword],
        last_serp_analysis: mockSerpData,
        context_data: { testData: mockSerpData },
        created_at: new Date().toISOString()
      });

    if (contextError) {
      console.error('❌ Failed to save context:', contextError);
      return { success: false, error: contextError };
    }

    // Retrieve context for suggestions
    const { data: contextData, error: retrieveError } = await supabase
      .from('serp_conversation_context')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (retrieveError) {
      console.error('❌ Failed to retrieve context:', retrieveError);
      return { success: false, error: retrieveError };
    }

    console.log('✅ Smart Suggestions Context:', contextData);
    return { success: true, contextData };

  } catch (error) {
    console.error('❌ Smart Suggestions Flow Test Failed:', error);
    return { success: false, error };
  }
}

/**
 * Run all SERP integration tests
 */
export async function runAllSerpTests(userId: string = 'test-user') {
  console.log('🚀 Running Complete SERP Integration Test Suite...');
  
  const results = {
    serpIntegration: await testSerpIntegration(),
    smartSuggestions: await testSmartSuggestionsFlow(userId),
    timestamp: new Date().toISOString()
  };

  console.log('📋 Test Results Summary:', results);
  return results;
}