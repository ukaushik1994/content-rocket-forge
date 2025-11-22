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
  
  const basePrompt = `You are a marketing campaign assistant. Your job is to collect campaign essentials through natural conversation.

RULES:
- Ask ONE question at a time
- Keep responses under 2 sentences
- NEVER ask about solution details if solutionId exists (we have that data)
- Required: campaign idea + campaign duration
- Optional: target audience (only if not clear from solution)
- Be natural and conversational
${hasSolutionData ? '\n🎯 SOLUTION DATA AVAILABLE - Skip all questions about features, benefits, target audience, pain points, use cases. Focus ONLY on campaign duration.' : ''}`;

  const stageContext = getStageContext(stage, collectedData);
  
  return `${basePrompt}

${stageContext}`;
}

/**
 * Provides context about what information to gather at each stage
 */
function getStageContext(stage: ConversationStage, data: EnhancedCampaignData): string {
  const hasIdea = !!data.whatTheyrePromoting || !!data.idea;
  const hasTimeline = !!data.timeline;
  const hasSolutionData = !!data.solutionId;
  const previousContext = buildPreviousContext(data);
  
  if (stage === 'collecting') {
    // Step 1: Get the campaign idea
    if (!hasIdea) {
      return `Your task: Ask what campaign they want to create. Be conversational and simple.\n${previousContext}`;
    }
    
    // Step 2: Get campaign duration (required)
    if (!hasTimeline) {
      return `Your task: Ask how long they want to run this campaign. Options: 1 week, 2 weeks, 4 weeks, or ongoing. Keep it natural.\n${previousContext}`;
    }
    
    // If we have idea + timeline, we're done!
    return `You have enough information (idea + duration${hasSolutionData ? ' + solution data' : ''}). Say "Perfect! Let me generate comprehensive campaign strategies for you." and end.\n${previousContext}`;
  }
  
  if (stage === 'generating') {
    return 'Information collected! Let them know you\'re building comprehensive strategies.';
  }
  
  if (stage === 'complete') {
    return 'Strategies are ready for selection.';
  }
  
  return 'Continue...';
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
