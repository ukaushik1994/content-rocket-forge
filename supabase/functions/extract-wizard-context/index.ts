import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCorsPreflightRequest } from '../shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY');

async function decryptApiKey(encryptedKey: string, userId: string): Promise<string> {
  if (!ENCRYPTION_KEY) return encryptedKey;
  try {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(ENCRYPTION_KEY),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    const derivedKey = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: new TextEncoder().encode(userId), iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    const raw = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));
    const iv = raw.slice(0, 12);
    const data = raw.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, derivedKey, data);
    return new TextDecoder().decode(decrypted);
  } catch {
    return encryptedKey;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCorsPreflightRequest(req);
  const origin = req.headers.get('origin');
  const cors = getCorsHeaders(origin);

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const anonClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!);
    
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const { userPrompt, conversationHistory, solutions } = await req.json();

    // Get user's active AI provider
    const { data: providers } = await supabase
      .from('ai_service_providers')
      .select('provider, api_key, preferred_model')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .limit(1);

    if (!providers || providers.length === 0) {
      return new Response(JSON.stringify({ error: 'No active AI provider configured' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const provider = providers[0];
    const apiKey = await decryptApiKey(provider.api_key, user.id);

    // Build the solutions list for matching
    const solutionsList = (solutions || []).map((s: any) => `- "${s.name}" (ID: ${s.id})`).join('\n');

    const systemPrompt = `You are a context extraction assistant. Your job is to analyze user input and conversation history to extract structured data for a content creation wizard.

Extract the following fields from the user's current message AND any relevant conversation history:
- keyword: The main topic or keyword they want to write about
- solution_id: If they mention a product/solution/offering, match it to one from the list below and return its ID. Return null if no match.
- content_type: One of: "blog", "landing-page", "social-post", "email", "ad-copy", "case-study", "whitepaper". Default to "blog" if unclear.
- tone: e.g. "professional", "casual", "conversational", "authoritative", "friendly". Return empty string if not mentioned.
- target_audience: Who is this content for? Return empty string if not mentioned.
- content_goal: e.g. "educate", "generate leads", "build awareness", "convert". Return empty string if not mentioned.
- writing_style: One of "conversational", "professional", "academic", "casual". Return "conversational" if not mentioned.
- specific_points: Array of specific things to include. Return empty array if none mentioned.
- additional_instructions: Any other directives. Return empty string if none.

Available solutions/offerings:
${solutionsList || 'No solutions configured yet.'}

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation. Example:
{
  "keyword": "AI in healthcare",
  "solution_id": "uuid-here-or-null",
  "content_type": "blog",
  "tone": "professional",
  "target_audience": "healthcare executives",
  "content_goal": "educate",
  "writing_style": "professional",
  "specific_points": ["include ROI data", "mention compliance"],
  "additional_instructions": ""
}`;

    // Build conversation context
    const historyText = (conversationHistory || [])
      .slice(-10)
      .map((m: any) => `${m.role}: ${m.content}`)
      .join('\n');

    const userMessage = `Current user input: "${userPrompt}"

${historyText ? `Recent conversation history:\n${historyText}` : 'No prior conversation context.'}

Extract all wizard-relevant fields from both the current input and conversation history. Return JSON only.`;

    // Call AI via ai-proxy
    const proxyResponse = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        service: provider.provider,
        endpoint: 'chat',
        params: {
          model: provider.preferred_model || 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.3,
          max_tokens: 500,
        },
        apiKey,
      }),
    });

    const proxyData = await proxyResponse.json();
    
    // Extract content from the nested response structure
    const content = proxyData?.data?.choices?.[0]?.message?.content 
      || proxyData?.choices?.[0]?.message?.content 
      || '';

    // Parse the JSON response
    let extracted;
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extracted = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI extraction response:', content);
      // Return sensible defaults using the user prompt as keyword
      extracted = {
        keyword: userPrompt || '',
        solution_id: null,
        content_type: 'blog',
        tone: '',
        target_audience: '',
        content_goal: '',
        writing_style: 'conversational',
        specific_points: [],
        additional_instructions: '',
      };
    }

    return new Response(JSON.stringify(extracted), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('extract-wizard-context error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
