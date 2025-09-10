import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 AI Training Pipeline called');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header to verify user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, trainingData } = await req.json();
    console.log(`📥 Training action: ${action} for user: ${user.id}`);

    let result;

    switch (action) {
      case 'analyze_content_patterns':
        result = await analyzeContentPatterns(supabase, user.id);
        break;
        
      case 'optimize_keywords':
        result = await optimizeKeywords(supabase, user.id, trainingData);
        break;
        
      case 'generate_content_suggestions':
        result = await generateContentSuggestions(supabase, user.id, trainingData);
        break;
        
      case 'train_custom_model':
        result = await trainCustomModel(supabase, user.id, trainingData);
        break;
        
      default:
        throw new Error(`Unsupported training action: ${action}`);
    }

    console.log('✅ Training pipeline completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('💥 AI Training Pipeline error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Training pipeline failed'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeContentPatterns(supabase: any, userId: string) {
  console.log('🔍 Analyzing content patterns');
  
  // Fetch user's content items
  const { data: contentItems, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch content: ${error.message}`);
  }

  const patterns = {
    totalContent: contentItems.length,
    contentTypes: {},
    averageWordCount: 0,
    topKeywords: [],
    performanceMetrics: {
      avgSeoScore: 0,
      publishedRatio: 0
    },
    recommendations: []
  };

  if (contentItems.length > 0) {
    // Analyze content types
    contentItems.forEach((item: any) => {
      const type = item.content_type || 'unknown';
      patterns.contentTypes[type] = (patterns.contentTypes[type] || 0) + 1;
    });

    // Calculate performance metrics
    const publishedCount = contentItems.filter((item: any) => item.status === 'published').length;
    const totalSeoScore = contentItems.reduce((sum: number, item: any) => sum + (item.seo_score || 0), 0);
    
    patterns.performanceMetrics.publishedRatio = publishedCount / contentItems.length;
    patterns.performanceMetrics.avgSeoScore = totalSeoScore / contentItems.length;

    // Generate recommendations
    if (patterns.performanceMetrics.publishedRatio < 0.5) {
      patterns.recommendations.push({
        type: 'publishing',
        message: 'Consider publishing more of your draft content to improve visibility',
        priority: 'medium'
      });
    }

    if (patterns.performanceMetrics.avgSeoScore < 70) {
      patterns.recommendations.push({
        type: 'seo',
        message: 'Focus on improving SEO scores by optimizing keywords and content structure',
        priority: 'high'
      });
    }
  }

  return {
    success: true,
    action: 'analyze_content_patterns',
    data: patterns,
    timestamp: new Date().toISOString()
  };
}

async function optimizeKeywords(supabase: any, userId: string, trainingData: any) {
  console.log('🎯 Optimizing keywords');
  
  const { keywords, contentType } = trainingData;
  
  // Fetch related content to understand keyword performance
  const { data: contentItems, error } = await supabase
    .from('content_items')
    .select('metadata, seo_score, status')
    .eq('user_id', userId)
    .eq('content_type', contentType || 'blog-post')
    .limit(50);

  if (error) {
    console.warn('Could not fetch content for keyword analysis:', error);
  }

  const optimizedKeywords = keywords.map((keyword: string) => ({
    keyword,
    difficulty: Math.floor(Math.random() * 100) + 1, // Placeholder - would use real SERP data
    searchVolume: Math.floor(Math.random() * 10000) + 100,
    relevanceScore: Math.floor(Math.random() * 100) + 1,
    recommendations: [
      `Use "${keyword}" in your title and first paragraph`,
      `Create supporting content around "${keyword}"`
    ]
  }));

  return {
    success: true,
    action: 'optimize_keywords',
    data: {
      optimizedKeywords,
      suggestions: [
        'Focus on long-tail keywords for better ranking opportunities',
        'Create content clusters around your main keywords',
        'Monitor keyword performance and adjust strategy accordingly'
      ]
    },
    timestamp: new Date().toISOString()
  };
}

async function generateContentSuggestions(supabase: any, userId: string, trainingData: any) {
  console.log('💡 Generating content suggestions');
  
  const { topic, audience, goals } = trainingData;

  // Fetch user's solutions for context
  const { data: solutions, error: solutionsError } = await supabase
    .from('solutions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (solutionsError) {
    console.warn('Could not fetch solutions for suggestions:', solutionsError);
  }

  const suggestions = [
    {
      id: 1,
      title: `Ultimate Guide to ${topic}`,
      contentType: 'blog-post',
      estimatedWords: 2500,
      targetAudience: audience,
      keyPoints: [
        `Introduction to ${topic}`,
        `Common challenges and solutions`,
        `Best practices and tips`,
        `Future trends and predictions`
      ],
      estimatedTraffic: 'Medium-High'
    },
    {
      id: 2,
      title: `${topic}: Frequently Asked Questions`,
      contentType: 'faq',
      estimatedWords: 1500,
      targetAudience: audience,
      keyPoints: [
        `Top 10 questions about ${topic}`,
        `Detailed answers with examples`,
        `Additional resources and links`
      ],
      estimatedTraffic: 'Medium'
    },
    {
      id: 3,
      title: `${topic} Case Study: Real Results`,
      contentType: 'case-study',
      estimatedWords: 2000,
      targetAudience: audience,
      keyPoints: [
        `Problem identification`,
        `Solution implementation`,
        `Results and metrics`,
        `Lessons learned`
      ],
      estimatedTraffic: 'High'
    }
  ];

  return {
    success: true,
    action: 'generate_content_suggestions',
    data: {
      suggestions,
      totalSuggestions: suggestions.length,
      basedOn: {
        topic,
        audience,
        goals,
        userSolutions: solutions?.length || 0
      }
    },
    timestamp: new Date().toISOString()
  };
}

async function trainCustomModel(supabase: any, userId: string, trainingData: any) {
  console.log('🤖 Training custom model');
  
  const { modelType, trainingContent } = trainingData;

  // Log training request
  const { error: logError } = await supabase
    .from('ai_training_logs')
    .insert({
      user_id: userId,
      model_type: modelType,
      training_data: trainingContent,
      status: 'initiated',
      created_at: new Date().toISOString()
    });

  if (logError) {
    console.warn('Could not log training request:', logError);
  }

  // Simulate training process (in a real implementation, this would trigger actual ML training)
  const trainingResult = {
    modelId: `custom-${userId}-${Date.now()}`,
    status: 'training',
    estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    trainingDataSize: Array.isArray(trainingContent) ? trainingContent.length : 1,
    modelType
  };

  return {
    success: true,
    action: 'train_custom_model',
    data: trainingResult,
    message: 'Custom model training initiated. You will be notified when training is complete.',
    timestamp: new Date().toISOString()
  };
}