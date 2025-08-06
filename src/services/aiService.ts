
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  actions?: ContextualAction[];
  metadata?: {
    model?: string;
    provider?: string;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
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
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to use AI chat');
      return null;
    }

    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        messages,
        context,
        userId: user.id
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
      actions: generateContextualActions(data.message || data.content || '', context),
      metadata: {
        model: data.model,
        provider: data.provider,
        usage: data.usage
      }
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
  
  // Import AIServiceController dynamically to avoid circular imports
  const { default: AIServiceController } = await import('./aiService/AIServiceController');
  
  try {
    const result = await AIServiceController.generate({
      input: params.messages.map(m => m.content).join('\n'),
      use_case: 'chat',
      temperature: params.temperature,
      max_tokens: params.maxTokens,
      model: params.model
    });

    if (!result) {
      return null;
    }

    return {
      choices: [{
        message: {
          content: result.content
        }
      }],
      usage: result.usage
    };
    
  } catch (error: any) {
    console.error('Chat request failed:', error);
    toast.error('Failed to generate content. Please check your API configuration in Settings.');
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
