
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  actions?: ContextualAction[];
}

export interface ContextualAction {
  id: string;
  type: 'button' | 'card';
  label: string;
  action: string;
  data?: any;
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
  description?: string;
}

// Extended parameters interface for backward compatibility
export interface ChatRequestParams {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Send a chat message to the AI assistant
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  context?: any
): Promise<ChatResponse | null> {
  try {
    console.log('🤖 Sending chat message to AI service');
    
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        messages,
        context,
        stream: false
      }
    });

    if (error) {
      console.error('AI service error:', error);
      toast.error('Failed to get AI response. Please try again.');
      return null;
    }

    if (!data) {
      console.warn('No response from AI service');
      return null;
    }

    return {
      message: data.message || data.content || '',
      actions: generateContextualActions(data.message || data.content || '', context)
    };
  } catch (error: any) {
    console.error('Error calling AI service:', error);
    toast.error('AI service unavailable. Please check your API configuration.');
    return null;
  }
}

/**
 * Enhanced function for AI content generation using OpenRouter
 */
export async function sendChatRequest(
  provider: string,
  params: ChatRequestParams
): Promise<any> {
  console.log(`🚀 Sending chat request to ${provider}:`, { temperature: params.temperature, model: params.model });
  
  try {
    // Use the OpenRouter hook for OpenRouter requests
    if (provider === 'openrouter') {
      const { data, error } = await supabase.functions.invoke('openrouter-content-generator', {
        body: {
          prompt: params.messages.map(m => m.content).join('\n'),
          user_id: (await supabase.auth.getUser()).data.user?.id,
          model: params.model,
          temperature: params.temperature || 0.7
        }
      });
      
      if (error) {
        console.error('OpenRouter function error:', error);
        throw new Error(error.message);
      }
      
      return {
        choices: [{
          message: {
            content: data.generatedText
          }
        }],
        usage: data.usage
      };
    }
    
    // For other providers, use the AI proxy
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: {
        service: provider,
        endpoint: 'chat',
        params: {
          messages: params.messages,
          model: params.model,
          temperature: params.temperature || 0.7,
          maxTokens: params.maxTokens || 4000
        }
      }
    });
    
    if (error) {
      console.error('AI proxy error:', error);
      throw new Error(error.message);
    }
    
    return data;
    
  } catch (error: any) {
    console.error('Chat request failed:', error);
    toast.error(`Failed to generate content with ${provider}. Please check your API key in Settings.`);
    return null;
  }
}

/**
 * Generate contextual actions based on AI response and context
 */
function generateContextualActions(
  aiResponse: string, 
  context?: any
): ContextualAction[] {
  const actions: ContextualAction[] = [];
  const lowerResponse = aiResponse.toLowerCase();

  // Content creation actions
  if (lowerResponse.includes('keyword') || lowerResponse.includes('seo')) {
    actions.push({
      id: 'keyword-research',
      type: 'button',
      label: 'Start Keyword Research',
      action: 'navigate:/research/keyword-research',
      variant: 'primary'
    });
  }

  if (lowerResponse.includes('content') || lowerResponse.includes('article') || lowerResponse.includes('blog')) {
    actions.push({
      id: 'content-builder',
      type: 'button',
      label: 'Open Content Builder',
      action: 'navigate:/content-builder',
      variant: 'primary'
    });
  }

  if (lowerResponse.includes('strategy') || lowerResponse.includes('plan')) {
    actions.push({
      id: 'content-strategy',
      type: 'button',
      label: 'Content Strategy',
      action: 'navigate:/research/content-strategy',
      variant: 'secondary'
    });
  }

  // Analytics actions
  if (lowerResponse.includes('analytics') || lowerResponse.includes('performance')) {
    actions.push({
      id: 'view-analytics',
      type: 'button',
      label: 'View Analytics',
      action: 'navigate:/analytics',
      variant: 'outline'
    });
  }

  return actions.slice(0, 3); // Limit to 3 actions max
}

export async function testAIConnection(): Promise<boolean> {
  try {
    const response = await sendChatMessage([
      { role: 'user', content: 'Hello' }
    ]);
    return !!response;
  } catch (error) {
    console.error('AI connection test failed:', error);
    return false;
  }
}
