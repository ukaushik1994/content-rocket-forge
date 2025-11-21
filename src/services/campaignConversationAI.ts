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
  const basePrompt = `You are an expert marketing strategist conducting a campaign planning conversation. You ask thoughtful, contextual questions to gather campaign requirements.

CRITICAL RULES:
1. Ask ONE focused question at a time
2. Reference their previous responses naturally to show you're listening
3. Be conversational and encouraging
4. Keep questions specific and actionable
5. Use bullet points for sub-questions when needed
6. Your response should ONLY be the next question - no explanations, no analysis yet`;

  const stageContext = getStageContext(stage, collectedData);
  
  return `${basePrompt}

CURRENT STAGE: ${stage}
${stageContext}

Remember: Your job is ONLY to ask the next question. Keep it conversational and reference what they've told you so far.`;
}

/**
 * Provides context about what information to gather at each stage
 */
function getStageContext(stage: ConversationStage, data: EnhancedCampaignData): string {
  const previousContext = buildPreviousContext(data);
  
  switch (stage) {
    case 'collecting':
      return `OBJECTIVE: Have a natural conversation to understand their campaign.

KEEP IT SIMPLE - Ask about:
1. What are they promoting? (product, service, feature, or general campaign idea)
2. Who is it for? (target audience in simple terms - don't ask for roles/sizes/industries separately)
3. Timeline preference (if not mentioned)

RULES:
- ONE simple question at a time
- NO sub-bullets or detailed breakdowns
- Be conversational and natural
- If they mention a solution/product name, note it but don't make a big deal about it
- Once you have WHAT and WHO, you can generate

${previousContext}`;

    case 'generating':
      return `All information collected! Acknowledge receipt and let them know you're generating strategies.`;

    case 'complete':
      return `Strategies have been generated and are ready for selection.`;

    default:
      return 'Ask them to continue...';
  }
}

/**
 * Builds a summary of previously collected data
 */
function buildPreviousContext(data: EnhancedCampaignData): string {
  const context: string[] = [];
  
  if (data.idea) context.push(`Campaign: ${data.idea}`);
  if (data.painPoints) context.push(`Pain Point: ${data.painPoints}`);
  if (data.competitors) context.push(`Competitors: ${data.competitors}`);
  if (data.uniqueValue) context.push(`Unique Value: ${data.uniqueValue}`);
  if (data.targetAudience) context.push(`Audience: ${data.targetAudience}`);
  if (data.goal) context.push(`Goal: ${data.goal}`);
  if (data.successMetrics) context.push(`Success Metrics: ${data.successMetrics}`);
  if (data.timeline) context.push(`Timeline: ${data.timeline}`);
  if (data.distributionChannels && data.distributionChannels.length > 0) {
    context.push(`Distribution Channels: ${data.distributionChannels.join(', ')}`);
  }
  if (data.solutionId) context.push(`Solution: Linked to specific solution`);
  
  return context.length > 0 ? `\nPREVIOUSLY COLLECTED:\n${context.join('\n')}` : '';
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
