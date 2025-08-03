
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { opportunityId, userId } = await req.json()

    // Get opportunity data
    const { data: opportunity, error } = await supabase
      .from('content_opportunities')
      .select('*')
      .eq('id', opportunityId)
      .eq('user_id', userId)
      .single()

    if (error || !opportunity) {
      throw new Error('Opportunity not found')
    }

    // Generate content brief using AI
    const brief = await generateBriefWithAI(opportunity)

    // Save the brief
    const { data: savedBrief, error: briefError } = await supabase
      .from('opportunity_briefs')
      .insert({
        user_id: userId,
        opportunity_id: opportunityId,
        title: brief.title,
        content_type: opportunity.content_format,
        introduction: brief.introduction,
        outline: brief.outline,
        faq_section: brief.faq_section,
        internal_links: brief.internal_links,
        meta_title: brief.meta_title,
        meta_description: brief.meta_description,
        target_word_count: brief.target_word_count,
        content_brief: brief.content_brief,
        ai_model_used: 'gpt-4',
        generation_prompt: brief.generation_prompt,
        status: 'draft'
      })
      .select()
      .single()

    if (briefError) throw briefError

    return new Response(
      JSON.stringify({ brief: savedBrief }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating content brief:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function generateBriefWithAI(opportunity: any) {
  // Call the existing API proxy to generate content brief
  const aiResponse = await supabase.functions.invoke('api-proxy', {
    body: {
      provider: 'openai',
      messages: [
        {
          role: 'system',
          content: 'You are a content strategist creating comprehensive content briefs. Generate structured, actionable content briefs optimized for search engines and AI overviews.'
        },
        {
          role: 'user',
          content: `Create a comprehensive content brief for the keyword "${opportunity.keyword}".
          
          Context:
          - Search Volume: ${opportunity.search_volume}
          - Keyword Difficulty: ${opportunity.keyword_difficulty}
          - Content Format: ${opportunity.content_format}
          - AIO Friendly: ${opportunity.is_aio_friendly}
          
          Please provide:
          1. An engaging title
          2. A compelling introduction paragraph
          3. A detailed outline with H2 sections
          4. FAQ section with 3-5 questions
          5. Meta title and description
          6. Target word count
          7. Internal linking opportunities
          
          Format your response as JSON with these fields: title, introduction, outline (array), faq_section (array of {question, answer}), meta_title, meta_description, target_word_count, internal_links (array), content_brief (full markdown brief).`
        }
      ]
    }
  })

  if (aiResponse.data?.choices?.[0]?.message?.content) {
    try {
      const parsedResponse = JSON.parse(aiResponse.data.choices[0].message.content)
      return {
        ...parsedResponse,
        generation_prompt: `Content brief for keyword: ${opportunity.keyword}`
      }
    } catch (e) {
      // Fallback if AI doesn't return JSON
      const content = aiResponse.data.choices[0].message.content
      return {
        title: `Complete Guide to ${opportunity.keyword}`,
        introduction: `Learn everything you need to know about ${opportunity.keyword} in this comprehensive guide.`,
        outline: [
          `What is ${opportunity.keyword}?`,
          `Benefits and advantages`,
          `Implementation guide`,
          `Best practices`,
          `Common challenges and solutions`
        ],
        faq_section: [
          {
            question: `What is ${opportunity.keyword}?`,
            answer: `${opportunity.keyword} is a key concept that helps businesses improve their operations.`
          }
        ],
        meta_title: `${opportunity.keyword} - Complete Guide`,
        meta_description: `Discover everything about ${opportunity.keyword}. Learn benefits, implementation, and best practices.`,
        target_word_count: opportunity.content_format === 'guide' ? 2500 : 1500,
        internal_links: [],
        content_brief: content,
        generation_prompt: `Content brief for keyword: ${opportunity.keyword}`
      }
    }
  }

  // Ultimate fallback
  return {
    title: `Complete Guide to ${opportunity.keyword}`,
    introduction: `This comprehensive guide covers everything you need to know about ${opportunity.keyword}.`,
    outline: [
      `Introduction to ${opportunity.keyword}`,
      'Key benefits and advantages',
      'Implementation strategies',
      'Best practices and tips',
      'Conclusion and next steps'
    ],
    faq_section: [
      {
        question: `What is ${opportunity.keyword}?`,
        answer: `${opportunity.keyword} refers to strategies and practices that help organizations achieve their goals.`
      }
    ],
    meta_title: `${opportunity.keyword} - Complete Guide`,
    meta_description: `Learn about ${opportunity.keyword}, its benefits, and how to implement it effectively.`,
    target_word_count: 1500,
    internal_links: [],
    content_brief: `# ${opportunity.keyword} - Content Brief\n\nThis content piece should cover the fundamentals of ${opportunity.keyword} and provide actionable insights for readers.`,
    generation_prompt: `Content brief for keyword: ${opportunity.keyword}`
  }
}
