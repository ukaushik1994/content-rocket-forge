import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const body = await req.json();
    const { opportunityId, regenerate = false } = body;
    const userIdFromBody = body.userId ?? body.user_id;

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const userId = user.id;
    if (userIdFromBody && userIdFromBody !== userId) {
      return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    if (!opportunityId) {
      throw new Error('Opportunity ID is required');
    }

    console.log(`📝 Generating enhanced brief for opportunity: ${opportunityId}`);

    // Get opportunity details (scoped to authenticated user)
    const { data: opportunity, error: oppError } = await supabase
      .from('content_opportunities')
      .select(`
        *,
        content_briefs (*)
      `)
      .eq('id', opportunityId)
      .eq('user_id', userId)
      .single();

    if (oppError || !opportunity) {
      throw new Error('Opportunity not found');
    }

    // Check if brief already exists and we're not regenerating
    if (opportunity.content_briefs?.length > 0 && !regenerate) {
      return new Response(JSON.stringify({
        success: true,
        brief: opportunity.content_briefs[0],
        message: 'Brief already exists'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's AI providers
    const aiProvider = await getUserAIProvider(userId);

    // Get SERP data for context
    const serpData = opportunity.serp_data || await getCachedSerpData(opportunity.keyword);

    // Generate comprehensive brief
    const brief = await generateComprehensiveBrief(opportunity, serpData, aiProvider);

    // Save to database
    const { data: savedBrief, error: briefError } = await supabase
      .from('content_briefs')
      .insert([{
        user_id: userId || opportunity.user_id,
        opportunity_id: opportunityId,
        content_type: opportunity.content_format,
        title: brief.title,
        suggested_headings: brief.headings,
        introduction: brief.introduction,
        outline: brief.outline,
        faq_section: brief.faq,
        internal_links: brief.internal_links,
        external_links: brief.external_links,
        meta_title: brief.meta_title,
        meta_description: brief.meta_description,
        cta_suggestions: brief.cta_suggestions,
        target_word_count: brief.target_word_count,
        ai_model_used: aiProvider?.model || 'rule-based',
        generation_prompt: brief.generation_prompt,
        brief_content: brief.full_brief,
        quality_score: brief.quality_score
      }])
      .select()
      .single();

    if (briefError) {
      throw briefError;
    }

    console.log(`✅ Generated enhanced brief for: ${opportunity.keyword}`);

    return new Response(JSON.stringify({
      success: true,
      brief: savedBrief,
      message: 'Enhanced brief generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating enhanced brief:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

async function getUserAIProvider(userId: string) {
  try {
    const { data: userKeys } = await supabase
      .from('user_llm_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    // Priority: OpenRouter > Anthropic > Gemini > OpenAI
    const openrouter = userKeys?.find(k => k.provider === 'openrouter');
    const anthropic = userKeys?.find(k => k.provider === 'anthropic');
    const gemini = userKeys?.find(k => k.provider === 'gemini');
    const openai = userKeys?.find(k => k.provider === 'openai');

    if (openrouter?.api_key) {
      return {
        provider: 'openrouter',
        api_key: openrouter.api_key,
        model: openrouter.model || 'meta-llama/llama-3.2-3b-instruct:free'
      };
    }
    
    if (anthropic?.api_key) {
      return {
        provider: 'anthropic',
        api_key: anthropic.api_key,
        model: anthropic.model || 'claude-3-haiku-20240307'
      };
    }
    
    if (gemini?.api_key) {
      return {
        provider: 'gemini',
        api_key: gemini.api_key,
        model: gemini.model || 'gemini-pro'
      };
    }
    
    if (openai?.api_key) {
      return {
        provider: 'openai',
        api_key: openai.api_key,
        model: openai.model || 'gpt-4o-mini'
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user AI provider:', error);
    return null;
  }
}

async function callAIWithFallback(provider: any, prompt: string) {
  if (!provider) {
    throw new Error('No AI provider configured');
  }

  const messages = [{ role: 'user', content: prompt }];

  try {
    switch (provider.provider) {
      case 'openrouter':
        return await callOpenRouter(provider.api_key, provider.model, messages);
      case 'anthropic':
        return await callAnthropic(provider.api_key, provider.model, messages);
      case 'gemini':
        return await callGemini(provider.api_key, provider.model, messages);
      case 'openai':
        return await callOpenAI(provider.api_key, provider.model, messages);
      default:
        throw new Error(`Unsupported provider: ${provider.provider}`);
    }
  } catch (error) {
    console.error(`${provider.provider} API error:`, error);
    throw error;
  }
}

async function callOpenRouter(apiKey: string, model: string, messages: any[]) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: 2000
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callAnthropic(apiKey: string, model: string, messages: any[]) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2000
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

async function callGemini(apiKey: string, model: string, messages: any[]) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: messages.map(m => ({ parts: [{ text: m.content }] }))
    }),
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callOpenAI(apiKey: string, model: string, messages: any[]) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: 2000
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function getCachedSerpData(keyword: string) {
  const { data } = await supabase
    .from('raw_serp_data')
    .select('serp_response')
    .eq('keyword', keyword)
    .order('cached_at', { ascending: false })
    .limit(1)
    .single();
    
  return data?.serp_response || null;
}

async function generateComprehensiveBrief(opportunity: any, serpData: any, aiProvider: any) {
  if (!aiProvider) {
    console.log('⚠️ No AI provider configured, using template-based brief');
    return generateTemplateBrief(opportunity, serpData);
  }

  try {
    const organicResults = serpData?.organic_results || [];
    const paaQuestions = serpData?.people_also_ask || [];
    const relatedSearches = serpData?.related_searches || [];

    const prompt = `
You are an expert content strategist. Create a comprehensive content brief for the keyword: "${opportunity.keyword}"

CONTEXT:
- Content Type: ${opportunity.content_format}
- Priority: ${opportunity.priority}
- Opportunity Score: ${opportunity.opportunity_score}
- AIO Friendly: ${opportunity.is_aio_friendly}

SERP ANALYSIS:
Top Competitors: ${organicResults.slice(0, 5).map((r: any) => `${r.title} - ${r.snippet}`).join('\n')}

People Also Ask: ${paaQuestions.slice(0, 5).map((q: any) => q.question).join('\n')}

Related Searches: ${relatedSearches.slice(0, 5).map((r: any) => r.query).join(', ')}

CREATE A COMPREHENSIVE BRIEF WITH:

1. Optimized Title (50-60 characters, include target keyword)
2. Meta Description (150-160 characters, compelling and keyword-rich)
3. Introduction paragraph (hook + keyword + value proposition)
4. Detailed Content Outline (H2 and H3 headings with brief descriptions)
5. FAQ Section (based on PAA data, 5-8 questions with brief answers)
6. Internal Linking Opportunities (suggest 3-5 relevant internal links)
7. External Reference Sources (3-5 authoritative sources to cite)
8. Call-to-Action suggestions (3 different CTAs)
9. Target Word Count (based on competition analysis)
10. SEO Optimization Notes

RESPOND IN THIS JSON FORMAT:
{
  "title": "Optimized article title",
  "meta_title": "SEO optimized meta title",
  "meta_description": "Compelling meta description",
  "introduction": "Hook paragraph with keyword naturally included",
  "headings": ["H2 Heading 1", "H2 Heading 2", "H2 Heading 3"],
  "outline": [
    {
      "heading": "H2 Heading",
      "subheadings": ["H3 Sub 1", "H3 Sub 2"],
      "description": "What this section covers",
      "word_count": 300
    }
  ],
  "faq": [
    {
      "question": "Frequently asked question",
      "answer": "Brief answer with keyword usage"
    }
  ],
  "internal_links": [
    {
      "anchor_text": "Suggested anchor text",
      "target_topic": "Related topic to link to",
      "context": "Where in content to place"
    }
  ],
  "external_links": [
    {
      "source": "Authority domain",
      "topic": "What to reference",
      "url_type": "Type of source (study, guide, etc)"
    }
  ],
  "cta_suggestions": [
    "Try our free tool",
    "Download the guide",
    "Schedule a demo"
  ],
  "target_word_count": 2500,
  "seo_notes": "Key optimization recommendations",
  "quality_score": 95
}`;

    const content = await callAIWithFallback(aiProvider, prompt);
    
    try {
      const briefData = JSON.parse(content);
      
      return {
        ...briefData,
        generation_prompt: prompt,
        full_brief: generateMarkdownBrief(briefData, opportunity)
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return generateTemplateBrief(opportunity, serpData);
    }
    
  } catch (error) {
    console.error('AI API error:', error);
    return generateTemplateBrief(opportunity, serpData);
  }
}

function generateTemplateBrief(opportunity: any, serpData: any) {
  const keyword = opportunity.keyword;
  const contentType = opportunity.content_format;
  
  const brief = {
    title: `The Complete Guide to ${keyword}`,
    meta_title: `${keyword}: Complete Guide & Best Practices`,
    meta_description: `Discover everything you need to know about ${keyword}. Expert insights, best practices, and actionable tips.`,
    introduction: `${keyword} has become increasingly important in today's landscape. This comprehensive guide will walk you through everything you need to know to succeed with ${keyword}.`,
    headings: [
      `What is ${keyword}?`,
      `Why ${keyword} Matters`,
      `How to Implement ${keyword}`,
      `Best Practices for ${keyword}`,
      `Common Mistakes to Avoid`,
      `Conclusion`
    ],
    outline: [
      {
        heading: `What is ${keyword}?`,
        subheadings: ['Definition and Overview', 'Key Components'],
        description: 'Foundational understanding of the topic',
        word_count: 400
      },
      {
        heading: `Why ${keyword} Matters`,
        subheadings: ['Business Benefits', 'ROI Impact'],
        description: 'Value proposition and importance',
        word_count: 350
      },
      {
        heading: `How to Implement ${keyword}`,
        subheadings: ['Step-by-Step Process', 'Tools and Resources'],
        description: 'Practical implementation guide',
        word_count: 600
      },
      {
        heading: `Best Practices for ${keyword}`,
        subheadings: ['Expert Tips', 'Case Studies'],
        description: 'Advanced strategies and real examples',
        word_count: 500
      }
    ],
    faq: [
      {
        question: `What is ${keyword}?`,
        answer: `${keyword} is a fundamental concept that helps organizations improve their processes and outcomes.`
      },
      {
        question: `How do I get started with ${keyword}?`,
        answer: `Start by understanding the basics and identifying your specific use case for ${keyword}.`
      },
      {
        question: `What are the benefits of ${keyword}?`,
        answer: `${keyword} can help improve efficiency, reduce costs, and drive better results.`
      }
    ],
    internal_links: [
      {
        anchor_text: 'related tools',
        target_topic: 'tools and software',
        context: 'When discussing implementation'
      },
      {
        anchor_text: 'best practices guide',
        target_topic: 'general best practices',
        context: 'In the conclusion section'
      }
    ],
    external_links: [
      {
        source: 'Industry research',
        topic: 'Market statistics',
        url_type: 'Research study'
      },
      {
        source: 'Authority blog',
        topic: 'Expert insights',
        url_type: 'Thought leadership'
      }
    ],
    cta_suggestions: [
      'Get started with our free tool',
      'Download our comprehensive guide',
      'Schedule a consultation'
    ],
    target_word_count: contentType === 'glossary' ? 800 : 2000,
    seo_notes: `Focus on natural keyword integration, use semantic keywords, optimize for featured snippets.`,
    quality_score: 75,
    generation_prompt: 'Template-based generation',
    full_brief: ''
  };

  brief.full_brief = generateMarkdownBrief(brief, opportunity);
  return brief;
}

function generateMarkdownBrief(briefData: any, opportunity: any) {
  return `# Content Brief: ${briefData.title}

## Overview
- **Target Keyword**: ${opportunity.keyword}
- **Content Type**: ${opportunity.content_format}
- **Priority**: ${opportunity.priority}
- **Target Word Count**: ${briefData.target_word_count}
- **Opportunity Score**: ${opportunity.opportunity_score}

## SEO Metadata
- **Meta Title**: ${briefData.meta_title}
- **Meta Description**: ${briefData.meta_description}

## Introduction
${briefData.introduction}

## Content Outline
${briefData.outline.map((section: any, index: number) => `
### ${index + 1}. ${section.heading}
**Word Count**: ~${section.word_count} words
**Description**: ${section.description}

**Subheadings**:
${section.subheadings?.map((sub: string) => `- ${sub}`).join('\n') || ''}
`).join('\n')}

## FAQ Section
${briefData.faq.map((item: any) => `
**Q: ${item.question}**
A: ${item.answer}
`).join('\n')}

## Internal Linking Opportunities
${briefData.internal_links.map((link: any) => `
- **Anchor Text**: "${link.anchor_text}"
- **Target Topic**: ${link.target_topic}
- **Context**: ${link.context}
`).join('\n')}

## External References
${briefData.external_links.map((link: any) => `
- **Source Type**: ${link.url_type}
- **Topic**: ${link.topic}
- **Authority**: ${link.source}
`).join('\n')}

## Call-to-Action Suggestions
${briefData.cta_suggestions.map((cta: string) => `- ${cta}`).join('\n')}

## SEO Optimization Notes
${briefData.seo_notes}

---
*Generated by OpportunityHunter AI on ${new Date().toLocaleDateString()}*
`;
}