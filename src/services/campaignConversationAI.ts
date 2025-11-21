import { ConversationStage, EnhancedCampaignData } from '@/hooks/useCampaignConversation';
import { supabase } from '@/integrations/supabase/client';

/**
 * Campaign AI Generation Service
 * 
 * Uses: enhanced-ai-chat edge function
 * AI Providers: User-configured providers from ai_service_providers table
 * (OpenRouter, Anthropic, OpenAI, Gemini, Mistral, etc.)
 * 
 * IMPORTANT: Does NOT use Lovable AI - uses your personal API keys
 */

/**
 * Generates a system prompt for the campaign conversation AI
 */
function buildSystemPrompt(stage: ConversationStage, collectedData: EnhancedCampaignData): string {
  const hasSolutionData = !!collectedData.solutionId;
  
  const basePrompt = `You are a marketing campaign assistant. Your job is to collect information through natural conversation.

RULES:
- Ask ONE question at a time
- Keep questions short and conversational
- Don't ask about information already provided
- Use singular form, not bullet points
- Be friendly and natural
${hasSolutionData ? '- CRITICAL: Solution data is auto-filled. DO NOT ask about features, benefits, target audience, or pain points. Only ask about campaign tone, style, or messaging angle if needed.' : ''}`;

  const stageContext = getStageContext(stage, collectedData);
  
  return `${basePrompt}

${stageContext}`;
}

/**
 * Provides context about what information to gather at each stage
 */
function getStageContext(stage: ConversationStage, data: EnhancedCampaignData): string {
  const hasWhatTheyrePromoting = !!data.whatTheyrePromoting || !!data.idea;
  const hasWhoItsFor = !!data.targetAudience;
  const hasSolutionData = !!data.solutionId;
  const previousContext = buildPreviousContext(data);
  
  if (stage === 'collecting') {
    if (!hasWhatTheyrePromoting) {
      return `Your task: Ask what they want to promote.\n${previousContext}`;
    }
    
    // Skip asking about target audience if it's auto-filled from solution
    if (!hasWhoItsFor && !hasSolutionData) {
      return `Your task: Ask who the target audience is. Keep it simple - just ask "Who is it for?"\n${previousContext}`;
    }

    // If solution data is available, ask about campaign tone/style instead of redundant questions
    if (hasSolutionData && (!data.messagingTone || !data.campaignAngle)) {
      return `Your task: Since we have the solution details, ask about campaign tone or messaging style. For example: "What tone should we use - professional, friendly, or technical?" or "Any specific angle you want to focus on?"\n${previousContext}`;
    }

    // Once we have essentials, ask about channels if not provided
    if (!data.distributionChannels || data.distributionChannels.length === 0) {
      return `Your task: Ask about distribution channels. Say something like "Where would you like to promote this?"\n${previousContext}`;
    }
    
    return `You have enough information. Say something like "Perfect! Let me generate some campaign strategies for you." and end the conversation.\n${previousContext}`;
  }
  
  if (stage === 'generating') {
    return 'All information collected! Acknowledge receipt and let them know you\'re generating strategies.';
  }
  
  if (stage === 'complete') {
    return 'Strategies have been generated and are ready for selection.';
  }
  
  return 'Ask them to continue...';
}

/**
 * Builds a summary of previously collected data
 */
function buildPreviousContext(data: EnhancedCampaignData): string {
  const parts: string[] = [];
  const autoFilledParts: string[] = [];
  
  if (data.whatTheyrePromoting || data.idea) {
    parts.push(`Promoting: ${data.whatTheyrePromoting || data.idea}`);
  }

  // Track auto-filled solution data
  if (data.solutionId) {
    autoFilledParts.push('IMPORTANT: The following information was auto-filled from the solution database:');
    
    if (data.features && data.features.length > 0) {
      autoFilledParts.push(`- Features: ${data.features.join(', ')}`);
    }
    
    if (data.benefits && data.benefits.length > 0) {
      autoFilledParts.push(`- Benefits: ${data.benefits.join(', ')}`);
    }
    
    if (data.targetAudience) {
      autoFilledParts.push(`- Target audience: ${data.targetAudience}`);
    }

    if (data.painPoints) {
      autoFilledParts.push(`- Pain points: ${data.painPoints}`);
    }

    if (data.useCases && data.useCases.length > 0) {
      autoFilledParts.push(`- Use cases: ${data.useCases.join(', ')}`);
    }

    autoFilledParts.push('\nDO NOT ask about these auto-filled fields. Only ask about missing campaign-specific details like tone, messaging style, or specific angles.');
  }
  
  if (data.targetAudience && !data.solutionId) {
    parts.push(`Target audience: ${data.targetAudience}`);
  }

  if (data.goal) {
    parts.push(`Goal: ${data.goal}`);
  }

  if (data.timeline) {
    parts.push(`Timeline: ${data.timeline}`);
  }

  if (data.distributionChannels && data.distributionChannels.length > 0) {
    parts.push(`Distribution channels: ${data.distributionChannels.join(', ')}`);
  }

  let context = '';
  if (autoFilledParts.length > 0) {
    context += '\n' + autoFilledParts.join('\n');
  }
  if (parts.length > 0) {
    context += '\n\nPrevious context:\n' + parts.join('\n');
  }
  
  return context;
}

/**
 * Calls the AI service to generate the next question
 */
export async function generateAIQuestion(
  stage: ConversationStage,
  collectedData: EnhancedCampaignData,
  conversationHistory: Array<{ role: string; content: string }>,
  userId: string
): Promise<string> {
  // Build messages array outside try block so it's accessible in catch
  const systemPrompt = buildSystemPrompt(stage, collectedData);
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-5) // Only send last 5 messages for context
  ];
  
  try {
    console.log('[Campaign AI] Generating question for stage:', stage);
    console.log('[Campaign AI] Sending request with', messages.length, 'messages');
    
    const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
      body: {
        messages, // Send as 'messages' not 'conversationHistory'
        userId
      }
    });

    if (error) {
      console.error('[Campaign AI] Error calling AI service:', error);
      throw error;
    }

    const aiResponse = data.message || data.content || '';
    console.log('[Campaign AI] Generated question (first 100 chars):', aiResponse.substring(0, 100));
    
    return aiResponse;
  } catch (error: any) {
    const errorMsg = error.message || '';
    console.error('[Campaign AI] Error generating question:', error);
    
    // Check if it's a TPM rate limit error
    if (errorMsg.includes('TPM') || errorMsg.includes('tokens per min') || errorMsg.includes('Rate limit')) {
      console.warn('[Campaign AI] TPM rate limit detected, implementing cooldown and retry...');
      
      try {
        // Wait 30 seconds for TPM limit to reset
        console.log('[Campaign AI] Waiting 30s for rate limit cooldown...');
        await new Promise(r => setTimeout(r, 30000));
        
        // Single retry after cooldown
        console.log('[Campaign AI] Retrying after cooldown...');
        const { data: retryData, error: retryError } = await supabase.functions.invoke('enhanced-ai-chat', {
          body: {
            messages,
            userId
          }
        });
        
        if (!retryError && retryData?.message) {
          console.log('[Campaign AI] Retry successful after cooldown');
          return retryData.message || retryData.content || '';
        }
        
        console.warn('[Campaign AI] Retry failed, using fallback');
      } catch (retryError) {
        console.error('[Campaign AI] Retry failed:', retryError);
      }
    }
    
    // Fallback to a hardcoded question based on the stage
    return getFallbackQuestion(stage, collectedData);
  }
}

/**
 * Fallback to static question if AI fails
 */
export function getFallbackQuestion(stage: ConversationStage, data: EnhancedCampaignData): string {
  switch (stage) {
    case 'collecting':
      return "Let's create a winning campaign together! Tell me about your campaign idea, target audience, goals, and timeline.";
    
    case 'generating':
      return "🎉 Perfect! I have everything I need. Let me generate highly targeted campaign strategies for you...";
    
    case 'complete':
      return "✅ Your campaign strategies are ready!";
    
    default:
      return "Tell me more...";
  }
}
