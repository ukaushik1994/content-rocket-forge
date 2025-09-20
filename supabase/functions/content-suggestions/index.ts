import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface SuggestionRequest {
  content: string;
  context: {
    mainKeyword?: string;
    selectedKeywords?: string[];
    contentType?: string;
    focusAreas?: string[];
  };
  options?: {
    maxSuggestions?: number;
    includeReplacements?: boolean;
    confidenceThreshold?: 'high' | 'medium' | 'low';
  };
}

interface SuggestionReplacement {
  id: string;
  originalText: string;
  replacementText: string;
  reasoning: string;
  location: {
    paragraph: number;
    sentence: number;
    startIndex: number;
    endIndex: number;
  };
  confidence: 'high' | 'medium' | 'low';
}

interface StructuredSuggestion {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  type: 'content' | 'seo' | 'structure' | 'keywords' | 'readability';
  priority: 'high' | 'medium' | 'low';
  category: 'structure' | 'seo' | 'keywords' | 'solution' | 'content';
  autoFixable: boolean;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  replacements?: SuggestionReplacement[];
  example?: string;
}

// Get available API keys
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

/**
 * Creates specialized system prompt for content suggestions
 */
function createSuggestionSystemPrompt(): string {
  return `You are an expert content optimization assistant. Your job is to analyze content and provide specific, actionable suggestions for improvement.

CRITICAL RESPONSE FORMAT REQUIREMENTS:
1. You MUST respond in valid JSON format only
2. Do not include any text before or after the JSON
3. If you cannot generate suggestions, return {"suggestions": []}
4. Each suggestion must include exact text replacements with precise location information

JSON SCHEMA (follow exactly):
{
  "suggestions": [
    {
      "id": "unique_identifier",
      "title": "Clear, action-oriented title (max 60 chars)",
      "description": "What needs to be changed and why (max 150 chars)",
      "reasoning": "Detailed explanation of the improvement benefits",
      "type": "content|seo|structure|keywords|readability",
      "priority": "high|medium|low",
      "category": "structure|seo|keywords|solution|content",
      "autoFixable": true|false,
      "impact": "high|medium|low",
      "effort": "high|medium|low",
      "replacements": [
        {
          "id": "replacement_id",
          "originalText": "exact text from content to replace",
          "replacementText": "improved replacement text",
          "reasoning": "why this specific change improves the content",
          "location": {
            "paragraph": 1,
            "sentence": 2,
            "startIndex": 45,
            "endIndex": 78
          },
          "confidence": "high|medium|low"
        }
      ],
      "example": "brief example if helpful"
    }
  ]
}

FALLBACK FORMAT (if JSON parsing might fail):
SUGGESTION_START
Title: [title]
Description: [description]
Type: [type]
Priority: [priority]
Original: "[exact text]"
Replacement: "[new text]"
Reasoning: [why this improves content]
SUGGESTION_END`;
}

/**
 * Preprocesses content by adding structure markers
 */
function preprocessContentForAnalysis(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  let processedContent = '';
  let globalCharIndex = 0;

  paragraphs.forEach((paragraph, pIndex) => {
    processedContent += `[PARAGRAPH ${pIndex + 1}]\n`;
    
    const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    sentences.forEach((sentence, sIndex) => {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length > 0) {
        const startIndex = globalCharIndex;
        const endIndex = startIndex + trimmedSentence.length;
        
        processedContent += `[S${sIndex + 1}:${startIndex}-${endIndex}] ${trimmedSentence}.\n`;
        globalCharIndex = endIndex + 1;
      }
    });
    
    processedContent += '\n';
  });

  return processedContent;
}

/**
 * Creates user prompt for content analysis
 */
function createContentAnalysisPrompt(content: string, context: any): string {
  const preprocessedContent = preprocessContentForAnalysis(content);
  
  return `Analyze this content and provide 3-7 specific optimization suggestions with exact text replacements:

CONTENT STRUCTURE:
${preprocessedContent}

OPTIMIZATION CONTEXT:
- Main Keyword: ${context.mainKeyword || 'Not specified'}
- Additional Keywords: ${context.selectedKeywords?.join(', ') || 'None'}
- Content Length: ${content.length} characters
- Word Count: ${content.split(' ').length} words
- Content Type: ${context.contentType || 'General'}

ANALYSIS FOCUS:
1. SEO optimization (keyword usage, meta elements, structure)
2. Readability improvements (sentence flow, paragraph structure)
3. Content engagement (calls-to-action, value propositions)
4. Technical improvements (headings, formatting, links)

REQUIREMENTS FOR EACH SUGGESTION:
- Must include exact "originalText" that exists in the content
- Must provide specific "replacementText" 
- Must include precise location information (paragraph, sentence, character indices)
- Must explain the reasoning for the improvement
- Must assess impact and effort realistically

Focus on high-impact, implementable changes. Provide exact text matches and replacements.`;
}

/**
 * Calls OpenAI API
 */
async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2500,
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Calls Anthropic API
 */
async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!anthropicApiKey) {
    throw new Error('Anthropic API key not found');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicApiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2500,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Calls OpenRouter API
 */
async function callOpenRouter(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!openRouterApiKey) {
    throw new Error('OpenRouter API key not found');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://lovable.dev',
      'X-Title': 'Content Builder'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2500,
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Parses AI response with multiple fallback strategies
 */
function parseAIResponse(content: string): StructuredSuggestion[] {
  console.log('🔍 Parsing AI response...');
  
  // Strategy 1: Try direct JSON parse
  try {
    const parsed = JSON.parse(content.trim());
    if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
      console.log('✅ Successfully parsed direct JSON response');
      return parsed.suggestions;
    }
  } catch (error) {
    console.log('⚠️ Direct JSON parsing failed, trying extraction...');
  }

  // Strategy 2: Extract JSON from response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        console.log('✅ Successfully extracted and parsed JSON');
        return parsed.suggestions;
      }
    }
  } catch (error) {
    console.log('⚠️ JSON extraction failed, trying fallback format...');
  }

  // Strategy 3: Parse fallback format
  const fallbackSuggestions = parseFallbackFormat(content);
  if (fallbackSuggestions.length > 0) {
    console.log('✅ Successfully parsed fallback format');
    return fallbackSuggestions;
  }

  // Strategy 4: Extract basic suggestions from text
  const basicSuggestions = extractBasicSuggestions(content);
  if (basicSuggestions.length > 0) {
    console.log('✅ Successfully extracted basic suggestions from text');
    return basicSuggestions;
  }

  console.error('❌ All parsing strategies failed');
  return [];
}

/**
 * Parses fallback format
 */
function parseFallbackFormat(content: string): StructuredSuggestion[] {
  const suggestions: StructuredSuggestion[] = [];
  const suggestionBlocks = content.split('SUGGESTION_START').slice(1);

  suggestionBlocks.forEach((block, index) => {
    const endIndex = block.indexOf('SUGGESTION_END');
    if (endIndex === -1) return;

    const suggestionText = block.substring(0, endIndex).trim();
    const lines = suggestionText.split('\n').map(line => line.trim());

    const suggestion: Partial<StructuredSuggestion> = {
      id: `fallback_${index + 1}`,
      type: 'content',
      priority: 'medium',
      category: 'content',
      autoFixable: true,
      impact: 'medium',
      effort: 'medium'
    };

    lines.forEach(line => {
      if (line.startsWith('Title:')) {
        suggestion.title = line.substring(6).trim();
      } else if (line.startsWith('Description:')) {
        suggestion.description = line.substring(12).trim();
      } else if (line.startsWith('Type:')) {
        const type = line.substring(5).trim();
        if (['content', 'seo', 'structure', 'keywords', 'readability'].includes(type)) {
          suggestion.type = type as any;
        }
      } else if (line.startsWith('Priority:')) {
        const priority = line.substring(9).trim();
        if (['high', 'medium', 'low'].includes(priority)) {
          suggestion.priority = priority as any;
        }
      } else if (line.startsWith('Reasoning:')) {
        suggestion.reasoning = line.substring(10).trim();
      }
    });

    if (suggestion.title && suggestion.description) {
      suggestions.push(suggestion as StructuredSuggestion);
    }
  });

  return suggestions;
}

/**
 * Extracts basic suggestions from plain text
 */
function extractBasicSuggestions(content: string): StructuredSuggestion[] {
  const suggestions: StructuredSuggestion[] = [];
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  let suggestionCount = 0;

  lines.forEach((line) => {
    if (/^[\d\-\*\•]/.test(line.trim()) && line.length > 20) {
      suggestionCount++;
      const cleanLine = line.replace(/^[\d\-\*\•\s]+/, '').trim();
      
      if (cleanLine.length > 10) {
        suggestions.push({
          id: `extracted_${suggestionCount}`,
          title: cleanLine.substring(0, 60),
          description: cleanLine,
          reasoning: 'Extracted from AI response',
          type: 'content',
          priority: 'medium',
          category: 'content',
          autoFixable: false,
          impact: 'medium',
          effort: 'medium'
        });
      }
    }
  });

  return suggestions.slice(0, 6);
}

/**
 * Generates fallback suggestions when AI fails
 */
function generateFallbackSuggestions(content: string, context: any): StructuredSuggestion[] {
  const suggestions: StructuredSuggestion[] = [];
  const wordCount = content.split(' ').length;

  // Basic content length suggestion
  if (wordCount < 300) {
    suggestions.push({
      id: 'fallback_length',
      title: 'Expand Content Length',
      description: `Content is ${wordCount} words. Consider adding more detailed information.`,
      reasoning: 'Longer content typically performs better for SEO and provides more value to readers.',
      type: 'content',
      priority: 'medium',
      category: 'content',
      autoFixable: false,
      impact: 'medium',
      effort: 'medium'
    });
  }

  // Keyword usage suggestion
  if (context.mainKeyword && !content.toLowerCase().includes(context.mainKeyword.toLowerCase())) {
    suggestions.push({
      id: 'fallback_keyword',
      title: 'Include Main Keyword',
      description: `The main keyword "${context.mainKeyword}" is not found in the content.`,
      reasoning: 'Including the main keyword helps search engines understand the content topic.',
      type: 'seo',
      priority: 'high',
      category: 'keywords',
      autoFixable: false,
      impact: 'high',
      effort: 'low'
    });
  }

  return suggestions;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, context, options }: SuggestionRequest = await req.json();

    if (!content || content.trim().length < 50) {
      return new Response(JSON.stringify({ 
        error: 'Content must be at least 50 characters long for analysis' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🔄 Starting content suggestion generation...');
    console.log('Content length:', content.length);
    console.log('Context:', JSON.stringify(context, null, 2));

    const systemPrompt = createSuggestionSystemPrompt();
    const userPrompt = createContentAnalysisPrompt(content, context);

    let aiResponse: string;
    const errors: string[] = [];

    // Try different AI providers in order of preference
    try {
      console.log('🤖 Trying OpenAI...');
      aiResponse = await callOpenAI(systemPrompt, userPrompt);
    } catch (error: any) {
      console.warn('❌ OpenAI failed:', error.message);
      errors.push(`OpenAI: ${error.message}`);
      
      try {
        console.log('🤖 Trying Anthropic...');
        aiResponse = await callAnthropic(systemPrompt, userPrompt);
      } catch (error: any) {
        console.warn('❌ Anthropic failed:', error.message);
        errors.push(`Anthropic: ${error.message}`);
        
        try {
          console.log('🤖 Trying OpenRouter...');
          aiResponse = await callOpenRouter(systemPrompt, userPrompt);
        } catch (error: any) {
          console.warn('❌ OpenRouter failed:', error.message);
          errors.push(`OpenRouter: ${error.message}`);
          throw new Error(`All AI providers failed: ${errors.join(', ')}`);
        }
      }
    }

    console.log('✅ AI response received, parsing...');
    
    // Parse the AI response
    let suggestions = parseAIResponse(aiResponse!);
    
    // Generate fallback suggestions if parsing failed
    if (suggestions.length === 0) {
      console.log('⚠️ No suggestions parsed, generating fallback...');
      suggestions = generateFallbackSuggestions(content, context);
    }

    console.log(`✅ Generated ${suggestions.length} suggestions`);

    return new Response(JSON.stringify({ 
      suggestions,
      provider_used: 'content-suggestions-endpoint',
      debug: {
        content_length: content.length,
        word_count: content.split(' ').length,
        parsed_suggestions: suggestions.length,
        errors: errors.length > 0 ? errors : undefined
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Content suggestion generation failed:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      suggestions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});