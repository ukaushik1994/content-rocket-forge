
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../shared/cors.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface EnhancedRequest {
  messages: ChatMessage[];
  userId: string;
  conversationId?: string;
  solutions?: any[];
  analytics?: any;
  workflowContext?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    console.error('OPENAI_API_KEY not configured');
    return new Response(JSON.stringify({ 
      error: 'AI service not configured. Please add your OpenAI API key.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, userId, conversationId, solutions, analytics, workflowContext }: EnhancedRequest = await req.json();

    // Build enhanced context for AI
    let contextPrompt = `You are an intelligent content marketing assistant for a comprehensive content platform. 
    
IMPORTANT GUIDELINES:
- Never suggest navigation to other pages - handle everything in the chat
- Always provide actionable buttons and workflows
- Use real data when available, provide specific insights
- Create visual elements and interactive experiences
- Focus on helping users optimize their content strategy

AVAILABLE USER CONTEXT:`;

    if (solutions && solutions.length > 0) {
      contextPrompt += `\n\nUSER'S SOLUTIONS:`;
      solutions.forEach(solution => {
        contextPrompt += `\n- ${solution.name}: ${solution.features?.join(', ') || 'No features listed'}`;
        if (solution.painPoints?.length > 0) {
          contextPrompt += `\n  Pain Points: ${solution.painPoints.join(', ')}`;
        }
        if (solution.targetAudience?.length > 0) {
          contextPrompt += `\n  Target Audience: ${solution.targetAudience.join(', ')}`;
        }
      });
    }

    if (analytics) {
      contextPrompt += `\n\nCURRENT ANALYTICS:`;
      contextPrompt += `\n- Content pieces: ${analytics.totalContent || 0}`;
      contextPrompt += `\n- Published: ${analytics.published || 0}`;
      contextPrompt += `\n- In review: ${analytics.inReview || 0}`;
    }

    if (workflowContext) {
      contextPrompt += `\n\nWORKFLOW CONTEXT: ${JSON.stringify(workflowContext)}`;
    }

    contextPrompt += `\n\nWhen responding:
1. Always include specific action buttons using this JSON format in your response
2. For data visualizations, include chart specifications
3. For workflows, provide step-by-step guidance with interactive elements
4. Make recommendations based on the user's actual solutions and data

Response format should include:
- Clear, helpful text
- Specific action buttons in JSON format
- Visual data specifications when relevant
- Workflow progress indicators when in a workflow`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: contextPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    // Parse AI response for structured elements
    const parsedResponse = parseAIResponse(aiMessage);

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enhanced-ai-chat:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseAIResponse(message: string) {
  // Extract JSON blocks from AI response for actions and visual data
  const actionRegex = /```json\n(.*?)\n```/gs;
  const matches = [...message.matchAll(actionRegex)];
  
  let actions = [];
  let visualData = null;
  let cleanMessage = message;

  matches.forEach(match => {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.actions) {
        actions = parsed.actions;
      }
      if (parsed.visualData) {
        visualData = parsed.visualData;
      }
      // Remove the JSON block from the message
      cleanMessage = cleanMessage.replace(match[0], '');
    } catch (e) {
      console.error('Failed to parse AI JSON:', e);
    }
  });

  return {
    message: cleanMessage.trim(),
    actions,
    visualData,
    workflowContext: null // Will be populated by workflow engine
  };
}
