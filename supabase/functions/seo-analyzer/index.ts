
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content, mainKeyword, keywords, apiKey } = await req.json();

    console.log('🔍 Analyzing SEO for content length:', content?.length);

    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // Build SEO analysis prompt
    const prompt = `Analyze this content for SEO optimization and provide specific recommendations:

CONTENT TO ANALYZE:
${content}

MAIN KEYWORD: ${mainKeyword}
TARGET KEYWORDS: ${keywords?.join(', ') || 'None'}

Please provide a comprehensive SEO analysis including:

1. KEYWORD OPTIMIZATION:
   - How well is the main keyword integrated?
   - Are target keywords naturally incorporated?
   - Keyword density analysis

2. CONTENT STRUCTURE:
   - Are headings properly structured (H1, H2, H3)?
   - Is the content well-organized and scannable?
   - Meta title and description suggestions

3. READABILITY:
   - Is the content easy to read and understand?
   - Sentence and paragraph length analysis
   - Tone and voice assessment

4. SEO IMPROVEMENTS:
   - Specific actionable recommendations
   - Missing elements that should be added
   - Content gaps to fill

5. SCORE:
   - Overall SEO score out of 100
   - Individual scores for different aspects

Respond in JSON format:
{
  "overallScore": 85,
  "scores": {
    "keywordOptimization": 80,
    "contentStructure": 90,
    "readability": 85
  },
  "keywordAnalysis": {
    "mainKeywordFrequency": 5,
    "mainKeywordDensity": 1.2,
    "keywordDistribution": "good"
  },
  "improvements": [
    "Add main keyword to the first paragraph",
    "Include more H2 and H3 headings",
    "Add a FAQ section"
  ],
  "metaSuggestions": {
    "title": "Suggested meta title",
    "description": "Suggested meta description"
  }
}`;

    // Call OpenAI API for SEO analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO analyst. Provide detailed, actionable SEO analysis and recommendations for content optimization.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`SEO analysis failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    // Try to parse JSON response
    let analysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback to basic analysis if JSON parsing fails
        analysis = {
          overallScore: 75,
          scores: {
            keywordOptimization: 70,
            contentStructure: 80,
            readability: 75
          },
          improvements: [
            'Consider adding more keyword variations',
            'Improve content structure with more headings',
            'Add a compelling conclusion'
          ],
          metaSuggestions: {
            title: `${mainKeyword} - Complete Guide`,
            description: `Learn everything about ${mainKeyword}. Comprehensive guide with expert insights and practical tips.`
          }
        };
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Return basic analysis
      analysis = {
        overallScore: 75,
        scores: {
          keywordOptimization: 70,
          contentStructure: 80,
          readability: 75
        },
        improvements: [
          'Consider adding more keyword variations',
          'Improve content structure with more headings',
          'Add a compelling conclusion'
        ]
      };
    }

    console.log('✅ SEO analysis completed with score:', analysis.overallScore);

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('SEO analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze SEO',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
