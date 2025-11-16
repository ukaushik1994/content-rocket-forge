import { ConversationStage, EnhancedCampaignData } from '@/hooks/useCampaignConversation';
import { supabase } from '@/integrations/supabase/client';

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
    case 'idea':
      return `OBJECTIVE: Get them to describe their campaign idea - what product, feature, or service they're promoting.
      
Keep it simple and welcoming. This is the first question.`;

    case 'pain-points':
      return `PREVIOUS: They're promoting "${data.idea}"
${previousContext}

OBJECTIVE: Understand the specific problem this solves. What pain point are they addressing?

Reference their idea and ask about the problem it solves.`;

    case 'market-context':
      return `PREVIOUS: 
- Campaign idea: "${data.idea}"
- Pain point: "${data.painPoints}"
${previousContext}

OBJECTIVE: Understand the competitive landscape:
- Who are their main competitors?
- How does their approach differ?
- What makes the timing right?

Ask about competitors and market positioning.`;

    case 'unique-value':
      return `PREVIOUS:
- Campaign: "${data.idea}"
- Solving: "${data.painPoints}"
- Competitors: "${data.competitors}"
${previousContext}

OBJECTIVE: Identify their unique value proposition - what sets them apart from competitors.

Ask about what makes them unique compared to ${data.competitors || 'competitors'}.`;

    case 'audience':
      return `PREVIOUS:
- Campaign: "${data.idea}"
- Unique value: "${data.uniqueValue}"
${previousContext}

OBJECTIVE: Identify their target audience:
- Role/job title
- Industry
- Company size
- Current challenges

Ask who would benefit most from this solution.`;

    case 'audience-details':
      return `PREVIOUS:
- Target audience: "${data.targetAudience}"
${previousContext}

OBJECTIVE: Get specific about the audience:
- Seniority level
- Budget authority
- Current tools/solutions
- Technical sophistication

Dig deeper into ${data.targetAudience || 'their audience'}.`;

    case 'goal':
      return `PREVIOUS:
- Audience: "${data.targetAudience}"
${previousContext}

OBJECTIVE: Understand their primary campaign goal (awareness, conversion, engagement, or education).

Ask what they want to achieve with this campaign.`;

    case 'success-metrics':
      return `PREVIOUS:
- Goal: "${data.goal}"
${previousContext}

OBJECTIVE: Define specific success metrics:
- KPIs to track
- Realistic benchmarks
- Definition of success

Ask how they'll measure if the campaign succeeds.`;

    case 'timeline':
      return `PREVIOUS:
- Success looks like: "${data.successMetrics}"
${previousContext}

OBJECTIVE: Understand the timeline (1-week, 2-week, 4-week, or ongoing).

Ask how much time they have to execute and see results.`;

    case 'resources':
      return `PREVIOUS:
- Timeline: "${data.timeline}"
${previousContext}

OBJECTIVE: Understand available resources:
- Budget range
- Team size and skills
- Successful past channels
- Constraints/limitations

Ask about their resources and any constraints.`;

    case 'complete':
      return `All information collected! Acknowledge receipt and let them know you're generating strategies.`;

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
    case 'idea':
      return "Let's create a winning campaign together! Tell me about your campaign idea - what specific product, feature, or service are you planning to promote?";
    
    case 'pain-points':
      return `Great! You're promoting "${data.idea}". What specific problem does this solve for your users? What pain point are you addressing?`;
    
    case 'market-context':
      return `Got it! Now, let's talk competitive landscape:\n• Who are your main competitors?\n• How does your approach differ?\n• What makes your timing right?`;
    
    case 'unique-value':
      return `Thanks! What's the ONE thing that sets you apart from ${data.competitors || 'competitors'}? What's your unique value proposition?`;
    
    case 'audience':
      return `Perfect! Who is your ideal customer? Think about their role, industry, company size, and current challenges.`;
    
    case 'audience-details':
      return `Let's get more specific about ${data.targetAudience || 'your audience'}:\n• What level of seniority?\n• Budget authority?\n• Current tools/solutions?`;
    
    case 'goal':
      return `Excellent! What's your primary goal for this campaign with ${data.targetAudience || 'this audience'}?`;
    
    case 'success-metrics':
      return `Good! You want to achieve ${data.goal}. What numbers define success? What KPIs will you track?`;
    
    case 'timeline':
      return `Perfect! How much time do you have to execute this campaign and hit those metrics?`;
    
    case 'resources':
      return `Almost done! Let's talk resources:\n• Budget range?\n• Team size and skills?\n• What channels have worked best?`;
    
    case 'complete':
      return "🎉 Excellent! I have everything I need. Let me generate highly targeted campaign strategies for you...";
    
    default:
      return "Tell me more...";
  }
}
