/**
 * AI Streaming Edge Function - TRUE SSE STREAMING
 * 
 * Provides Server-Sent Events (SSE) streaming for AI chat responses.
 * Streams tokens directly from AI providers as they're generated.
 * 
 * Flow:
 * 1. Receives chat request with messages
 * 2. Fast-path for simple greetings (instant response)
 * 3. Streams AI response tokens via SSE in real-time
 * 4. Sends completion event with full content
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.6";
import { getCorsHeaders } from "../shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Fast-path detection for content creation intents (should go to wizard, not stream full content)
function isContentCreationIntent(query: string): boolean {
  const q = query.toLowerCase().trim();
  const patterns = [
    /\b(create|write|draft|generate|make|build|craft|compose)\b.{0,20}\b(a\s+)?(blog|article|post|guide|tutorial|whitepaper|case\s*study|newsletter|email|content|piece|copy)\b/i,
    /\b(blog|article|post|guide|tutorial|whitepaper|content)\b.{0,20}\b(about|on|for|regarding|covering)\b/i,
    /\b(help\s+me\s+)?(create|write|start)\b.{0,10}\b(content|writing)\b/i,
    /\b(new)\s+(blog|article|post|content)\b/i,
  ];
  return patterns.some(p => p.test(q));
}

function getWizardAcknowledgment(query: string): string {
  return `I'll launch the **Content Wizard** to guide you through creating this. It'll help with research, outline, and full content generation — let me set that up! 🚀`;
}

// Fast-path detection for conversational responses
function isSimpleGreeting(query: string): boolean {
  const q = query.toLowerCase().trim();
  const simplePatterns = [
    /^(hi|hello|hey|greetings)[\s!.?]*$/i,
    /^good\s*(morning|afternoon|evening|day)[\s!.?]*$/i,
    /^(thanks|thank\s*you|thx|ty)[\s!.?]*$/i,
    /^(ok|okay|got\s*it|understood|sure|great|perfect|awesome|cool)[\s!.?]*$/i,
    /^test(ing)?[\s!.?]*$/i,
    /^(bye|goodbye|see you|later|cya)[\s!.?]*$/i,
    /^(yes|yeah|yep|no|nope|nah)[\s!.?]*$/i,
  ];
  return simplePatterns.some(p => p.test(q));
}

function getQuickResponse(query: string): string {
  const q = query.toLowerCase().trim();
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  
  if (/^(hi|hello|hey|greetings)[\s!.?]*$/i.test(q)) {
    return `${timeGreeting}! 👋 How can I help with your content strategy today?`;
  }
  if (/^good\s*(morning|afternoon|evening|day)[\s!.?]*$/i.test(q)) {
    return `${timeGreeting} to you too! 👋 What would you like to explore?`;
  }
  if (/^(thanks|thank\s*you|thx|ty)[\s!.?]*$/i.test(q)) {
    return `You're welcome! 😊 Let me know if you need anything else.`;
  }
  if (/^(ok|okay|got\s*it|understood|sure|great|perfect|awesome|cool)[\s!.?]*$/i.test(q)) {
    return `Great! Feel free to ask if you have any questions.`;
  }
  if (/^test(ing)?[\s!.?]*$/i.test(q)) {
    return `✅ Streaming test successful! I'm ready to help with content, keywords, or campaigns.`;
  }
  if (/^(bye|goodbye|see you|later|cya)[\s!.?]*$/i.test(q)) {
    return `Goodbye! 👋 Come back anytime.`;
  }
  return `I'm here to help! What would you like to know?`;
}

// Stream from OpenAI-compatible APIs
async function streamOpenAI(
  apiKey: string,
  messages: any[],
  model: string,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder
): Promise<string> {
  console.log('🔌 Streaming from OpenAI...');
  
  const isNewerModel = model?.includes('gpt-5') || model?.includes('o3') || model?.includes('o4');
  
  const requestBody: any = {
    model: model || 'gpt-4',
    messages,
    stream: true,
    temperature: isNewerModel ? undefined : 0.7,
  };
  
  if (isNewerModel) {
    requestBody.max_completion_tokens = 2000;
  } else {
    requestBody.max_tokens = 2000;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullContent += content;
            const sseData = `data: ${JSON.stringify({ type: 'token', content })}\n\n`;
            await writer.write(encoder.encode(sseData));
          }
        } catch (e) {
          // Ignore parse errors for incomplete chunks
        }
      }
    }
  }

  return fullContent;
}

// Stream from OpenRouter
async function streamOpenRouter(
  apiKey: string,
  messages: any[],
  model: string,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder
): Promise<string> {
  console.log('🔌 Streaming from OpenRouter...');
  
  const isNewerModel = model?.includes('gpt-5') || model?.includes('o3') || model?.includes('o4');
  
  const requestBody: any = {
    model: model || 'openai/gpt-4-turbo',
    messages,
    stream: true,
    temperature: isNewerModel ? undefined : 0.7,
  };
  
  if (isNewerModel) {
    requestBody.max_completion_tokens = 2000;
  } else {
    requestBody.max_tokens = 2000;
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://creaiter.lovable.app',
      'X-Title': 'AI Content Creator'
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullContent += content;
            const sseData = `data: ${JSON.stringify({ type: 'token', content })}\n\n`;
            await writer.write(encoder.encode(sseData));
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }

  return fullContent;
}

// Stream from Anthropic
async function streamAnthropic(
  apiKey: string,
  messages: any[],
  model: string,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder
): Promise<string> {
  console.log('🔌 Streaming from Anthropic...');
  
  // Convert messages format for Anthropic
  const anthropicMessages = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }));
  
  const systemContent = messages.find(m => m.role === 'system')?.content || '';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-3-sonnet-20240229',
      system: systemContent,
      messages: anthropicMessages,
      stream: true,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '' || data === 'event: message_stop') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            const content = parsed.delta.text;
            fullContent += content;
            const sseData = `data: ${JSON.stringify({ type: 'token', content })}\n\n`;
            await writer.write(encoder.encode(sseData));
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }

  return fullContent;
}

// Stream from Gemini
async function streamGemini(
  apiKey: string,
  messages: any[],
  model: string,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder
): Promise<string> {
  console.log('🔌 Streaming from Gemini...');
  
  // Convert messages to Gemini format
  const contents = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const geminiModel = model || 'gemini-pro';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?alt=sse`,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        }
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) {
            fullContent += content;
            const sseData = `data: ${JSON.stringify({ type: 'token', content })}\n\n`;
            await writer.write(encoder.encode(sseData));
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }

  return fullContent;
}

// Stream from Mistral
async function streamMistral(
  apiKey: string,
  messages: any[],
  model: string,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder
): Promise<string> {
  console.log('🔌 Streaming from Mistral...');

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'mistral-large-latest',
      messages,
      stream: true,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullContent += content;
            const sseData = `data: ${JSON.stringify({ type: 'token', content })}\n\n`;
            await writer.write(encoder.encode(sseData));
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }

  return fullContent;
}

// Build an action-aware system prompt for streaming
function buildStreamingSystemPrompt(context?: any): string {
  const contextInfo = context ? `
CURRENT USER DATA:
- Content items: ${context.contentCount ?? 'unknown'}
- Keywords tracked: ${context.keywordCount ?? 'unknown'}
- Campaigns: ${context.campaignCount ?? 'unknown'}
- Contacts: ${context.contactCount ?? 'unknown'}
` : '';

  const analystMode = context?.analystActive ? `

## 📊 ANALYST MODE ACTIVE
The user has the Analyst sidebar panel open. They expect data-rich, visual responses.
CRITICAL: For EVERY response while Analyst is active:
1. ALWAYS include visualData JSON blocks with charts showing relevant metrics
2. ALWAYS include summaryInsights.metricCards (2-4 key stats)
3. ALWAYS include actionableItems and deepDivePrompts
4. Proactively surface data insights even if the user asks a general question
5. Default to multi-chart analysis when possible
Make every response a mini-dashboard. The Analyst panel will auto-render your chart data.
` : '';

  return `You are creAIter, an AI-powered content strategy assistant and the central intelligence of an end-to-end content marketing platform. You have full access to the user's workspace and can take real actions on their behalf.

${contextInfo}

## PLATFORM MODULES YOU CONTROL:
- **Offerings Hub** (/solutions): Product/service profiles with pain_points, UVPs, use_cases, features, benefits, pricing, case studies. Auto-populated during onboarding from website scraping. Selecting an offering auto-fills content briefs and campaign strategies.
- **Content Wizard** (AI Chat sidebar): Guided content creation. Blog formats use 5-step flow (Topic→Research→Outline→Config→Generate). Quick formats (social, email, ad) use 2-step flow. Offerings auto-fill brief fields via mapOfferingToBrief().
- **Content Builder** (/content-builder): Full editor with SEO analysis, brief config, SERP metrics. Same offering auto-fill as Wizard.
- **Content Repository** (/content): All content stored here. Status management, approval workflows, repurposing.
- **Campaigns** (/campaigns): Idea → AI strategies → Select → Generate assets via content_generation_queue → Track in real-time → Active. Offerings pre-populate strategy context.
- **Strategy Engine** (/strategy): SERP-driven keyword strategies and proposals. Proposals link to offerings and schedule to calendar.
- **Keywords** (/keywords): Position tracking, search volume, difficulty, content gap analysis. Feeds into Strategy and Wizard research.
- **Competitors** (/competitors): Profiles, solution discovery, SWOT analysis. Informs strategy competitive angles.
- **Brand Guidelines** (/brand): Colors, fonts, tone, personality. Injected into content generation for consistent voice.
- **Engage CRM** (/engage): Contacts, segments, email campaigns, journeys, automations, AI scoring.
- **Analytics**: Cross-platform performance dashboards. AI Chat generates multi-chart analyses on request.

## KEY DATA PIPELINES:
- **Offering → Content**: Offering data → mapOfferingToBrief() → Brief (audience, tone, points) → AI generation with full context → Repository
- **Offering → Campaign**: Offering → auto-fill campaign strategy → AI briefs → generation queue → Repository → Campaign active
- **Strategy → Calendar → Content**: SERP research → Proposals → Calendar (auto-schedules) → Builder/Wizard → Repository (auto-completes proposal)
- **Onboarding**: Website URL → AI scraper → company_info + solutions + brand_guidelines (auto-sequenced)

## CAPABILITIES — Actions you can execute:
**Content**: Create/update/delete blog posts, articles, drafts. Generate full content. Submit for review, approve, reject.
**Keywords**: Add/remove keywords. Run SERP analysis. Create topic clusters. Content gap analysis.
**Campaigns**: Trigger content generation. Retry failed content.
**Offerings**: Create/update/delete solutions. Add competitors. Run competitor analysis.
**Engage (CRM)**: Create/update contacts. Tag contacts. Create segments. Create/send email campaigns. Build journeys & automations.
**Cross-Module**: Promote content to campaigns. Convert content to email. Repurpose for social.

## BEHAVIOR RULES:
- When the user asks you to DO something (save, create, delete, send, etc.), acknowledge it confidently: "I'll save this as a draft for you" or "Creating the contact now..."
- Do NOT tell the user to copy/paste or do things manually — you have tools to do it.
- When the user asks to CREATE or WRITE content (blog, article, guide), DO NOT write the full content. Instead, briefly acknowledge and say you'll use the Content Wizard to guide them through research, outline, and generation. Keep your response under 2 sentences.
- When a user mentions an offering name, recognize it, reference its specific data points, and suggest aligned actions.
- Use markdown formatting for readability (headers, bold, lists).
- Be conversational but action-oriented.
- For read-only queries (show me, list, how many, analyze), provide data insights directly.
- Keep responses focused and avoid unnecessary preamble.
${analystMode}`;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context: requestContext, userId: bodyUserId, features } = await req.json();
    
    console.log('🚀 AI Streaming request received');
    console.log('📨 Messages count:', messages?.length || 0);

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user from auth
    const authHeader = req.headers.get('authorization');
    let user: any = null;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (authHeader) {
      const { data: { user: authUser }, error } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      if (authUser && !error) {
        user = authUser;
      }
    }

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's AI provider
    const { data: providers, error: providerError } = await supabase
      .from('ai_service_providers')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .limit(1);

    if (providerError || !providers || providers.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No AI provider configured. Please set up an AI provider in Settings.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const provider = providers[0];
    console.log(`🔌 Using provider: ${provider.provider} (${provider.preferred_model})`);

    // Get the latest user message
    const userQuery = messages?.[messages.length - 1]?.content || '';

    // Fast path for content creation intents (wizard handles these)
    if (isContentCreationIntent(userQuery)) {
      console.log('⚡ Fast path: Content creation intent detected — deferring to wizard');
      const wizardResponse = getWizardAcknowledgment(userQuery);
      
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();
      const encoder = new TextEncoder();

      (async () => {
        try {
          await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`));
          const words = wizardResponse.split(' ');
          for (const word of words) {
            const sseData = `data: ${JSON.stringify({ type: 'token', content: word + ' ' })}\n\n`;
            await writer.write(encoder.encode(sseData));
            await new Promise(r => setTimeout(r, 25));
          }
          const completeData = `data: ${JSON.stringify({ type: 'complete', content: wizardResponse })}\n\n`;
          await writer.write(encoder.encode(completeData));
          await writer.write(encoder.encode('data: [DONE]\n\n'));
        } finally {
          await writer.close();
        }
      })();

      return new Response(stream.readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Fast path for simple greetings
    if (isSimpleGreeting(userQuery)) {
      console.log('⚡ Fast path: Simple greeting detected');
      const quickResponse = getQuickResponse(userQuery);
      
      // Create SSE stream for fast response
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();
      const encoder = new TextEncoder();

      // Start streaming response
      (async () => {
        try {
          // Send start event
          await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`));
          
          // Send tokens word by word for natural effect
          const words = quickResponse.split(' ');
          for (const word of words) {
            const sseData = `data: ${JSON.stringify({ type: 'token', content: word + ' ' })}\n\n`;
            await writer.write(encoder.encode(sseData));
            await new Promise(r => setTimeout(r, 20));
          }

          // Send completion event
          const completeData = `data: ${JSON.stringify({ 
            type: 'complete', 
            content: quickResponse 
          })}\n\n`;
          await writer.write(encoder.encode(completeData));
          await writer.write(encoder.encode('data: [DONE]\n\n'));
        } finally {
          await writer.close();
        }
      })();

      return new Response(stream.readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Build system prompt with context
    const systemPrompt = buildStreamingSystemPrompt(requestContext);

    // Prepare messages with system prompt
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Create SSE stream
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start streaming in background
    (async () => {
      let fullContent = '';
      
      try {
        // Send start event
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`));

        // Stream based on provider
        switch (provider.provider) {
          case 'openai':
            fullContent = await streamOpenAI(
              provider.api_key,
              fullMessages,
              provider.preferred_model,
              writer,
              encoder
            );
            break;
          case 'openrouter':
            fullContent = await streamOpenRouter(
              provider.api_key,
              fullMessages,
              provider.preferred_model,
              writer,
              encoder
            );
            break;
          case 'anthropic':
            fullContent = await streamAnthropic(
              provider.api_key,
              fullMessages,
              provider.preferred_model,
              writer,
              encoder
            );
            break;
          case 'gemini':
            fullContent = await streamGemini(
              provider.api_key,
              fullMessages,
              provider.preferred_model,
              writer,
              encoder
            );
            break;
          case 'mistral':
            fullContent = await streamMistral(
              provider.api_key,
              fullMessages,
              provider.preferred_model,
              writer,
              encoder
            );
            break;
          default:
            throw new Error(`Unsupported provider for streaming: ${provider.provider}. Supported: openai, openrouter, anthropic, gemini, mistral`);
        }

        console.log(`✅ Streaming complete: ${fullContent.length} chars`);

        // Send completion event
        const completeData = `data: ${JSON.stringify({ 
          type: 'complete', 
          content: fullContent 
        })}\n\n`;
        await writer.write(encoder.encode(completeData));
        await writer.write(encoder.encode('data: [DONE]\n\n'));

      } catch (error: any) {
        console.error('❌ Streaming error:', error);
        const errorData = `data: ${JSON.stringify({ 
          type: 'error', 
          error: error.message || 'Streaming failed' 
        })}\n\n`;
        await writer.write(encoder.encode(errorData));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('❌ AI Streaming error:', error);
    const origin = req.headers.get('origin');
    return new Response(JSON.stringify({ 
      error: error.message || 'Streaming failed' 
    }), {
      status: 500,
      headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }
});
