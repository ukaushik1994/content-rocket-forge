
import { supabase } from '@/integrations/supabase/client';
import { aiAgentService } from './aiAgentService';
import { platformContextService, PlatformContext } from './platformContextService';
import { getFunctionDefinition, validateFunctionParameters, suggestFunctions } from './functionRegistry';
import { parameterInferenceService } from './parameterInferenceService';

class EnhancedAIAgentService {
  constructor() {
    this.addNavigationFunction();
  }

  async getEnhancedContext(basicContext: any): Promise<PlatformContext> {
    return await platformContextService.getFullContext(basicContext);
  }

  async processMessageWithIntelligence(message: string, context: PlatformContext): Promise<any> {
    console.log('Processing message with intelligence:', message);
    console.log('Context summary:', platformContextService.generateContextSummary(context));

    // Analyze user intent and suggest functions
    const suggestedFunctions = suggestFunctions(message, context);
    console.log('Suggested functions:', suggestedFunctions.map(f => f.name));

    // Enhanced system prompt with platform knowledge
    const systemPrompt = this.createIntelligentSystemPrompt(context, suggestedFunctions);

    // Create the analysis prompt
    const analysisPrompt = `
User message: "${message}"
Context: ${platformContextService.generateContextSummary(context)}

Available functions: ${suggestedFunctions.map(f => `${f.name} - ${f.description}`).join(', ')}

Analyze this request and determine:
1. What the user wants to accomplish
2. Which function(s) to call
3. What parameters are needed
4. Any missing information that needs clarification

Respond with a JSON object containing:
{
  "intent": "description of what user wants",
  "functions": [{"name": "functionName", "parameters": {...}, "confidence": 0.8}],
  "needsClarity": "any clarifying questions",
  "userResponse": "conversational response to user",
  "contextInsights": "relevant insights from current context"
}`;

    try {
      // This would call the AI service - for now, let's create a smart fallback
      const analysis = this.createSmartAnalysis(message, context, suggestedFunctions);
      
      // Process each function call with parameter inference
      if (analysis.functions && analysis.functions.length > 0) {
        for (const functionCall of analysis.functions) {
          const functionDef = getFunctionDefinition(functionCall.name);
          if (functionDef) {
            const inference = parameterInferenceService.inferParameters(
              functionDef,
              message,
              context,
              functionCall.parameters
            );

            // Validate parameters
            const validation = validateFunctionParameters(functionCall.name, inference.parameters);
            
            if (!validation.valid) {
              // Generate helpful error message with suggestions
              const clarificationPrompt = parameterInferenceService.generateParameterPrompt(functionDef, inference);
              analysis.needsClarity = clarificationPrompt;
              analysis.userResponse = `I'd like to help you with that! ${clarificationPrompt}`;
            } else {
              // Update function call with inferred parameters
              functionCall.parameters = inference.parameters;
            }
          }
        }
      }

      return analysis;
    } catch (error) {
      console.error('Error in intelligent processing:', error);
      return this.createFallbackResponse(message, context);
    }
  }

  private createSmartAnalysis(message: string, context: PlatformContext, suggestedFunctions: any[]): any {
    const messageLower = message.toLowerCase();
    const analysis: any = {
      intent: "general_query",
      functions: [],
      userResponse: "I'll help you with that!",
      contextInsights: ""
    };

    // Add context insights
    if (context.recentContent.length > 0) {
      analysis.contextInsights = `I can see you have ${context.recentContent.length} recent content items. `;
    }

    // Smart intent detection and function mapping
    if (messageLower.includes('create') && (messageLower.includes('content') || messageLower.includes('article'))) {
      analysis.intent = "create_content";
      analysis.functions.push({
        name: "createContent",
        parameters: {},
        confidence: 0.9
      });
      analysis.userResponse = "I'll help you create new content. Let me gather the details...";
    }
    
    else if (messageLower.includes('analyze') || messageLower.includes('keyword') || messageLower.includes('serp')) {
      analysis.intent = "keyword_analysis";
      analysis.functions.push({
        name: "analyzeKeyword",
        parameters: {},
        confidence: 0.8
      });
      analysis.userResponse = "I'll analyze that keyword for you and provide SERP insights.";
    }
    
    else if (messageLower.includes('show') || messageLower.includes('list') || messageLower.includes('my content')) {
      analysis.intent = "list_content";
      analysis.functions.push({
        name: "listContent",
        parameters: { limit: 10 },
        confidence: 0.8
      });
      analysis.userResponse = "Let me show you your content.";
    }
    
    else if (messageLower.includes('go to') || messageLower.includes('navigate') || messageLower.includes('take me')) {
      analysis.intent = "navigation";
      analysis.functions.push({
        name: "navigateToPage",
        parameters: {},
        confidence: 0.7
      });
    }
    
    else if (messageLower.includes('analytics') || messageLower.includes('performance')) {
      analysis.intent = "get_analytics";
      analysis.functions.push({
        name: "getAnalytics",
        parameters: { limit: 10 },
        confidence: 0.8
      });
      analysis.userResponse = "I'll get your analytics data for you.";
    }

    return analysis;
  }

  private createFallbackResponse(message: string, context: PlatformContext): any {
    return {
      intent: "general_help",
      functions: [],
      userResponse: `I understand you're asking about "${message}". I'm here to help with content creation, SERP analysis, analytics, and platform navigation. Could you be more specific about what you'd like to accomplish?`,
      contextInsights: `Currently on ${context.pageName}. ${context.recentContent.length > 0 ? `You have ${context.recentContent.length} recent content items.` : ''}`
    };
  }

  private createIntelligentSystemPrompt(context: PlatformContext, suggestedFunctions: any[]): string {
    return `You are an intelligent AI assistant for a content platform. You have deep knowledge of SEO, content creation, and platform workflows.

CURRENT CONTEXT:
- Page: ${context.pageName}
- User has ${context.recentContent.length} recent content items
- Platform capabilities: Content Builder, SERP Analysis, Analytics, Solutions Management
${context.companyInfo ? `- Company: ${context.companyInfo.name}` : ''}
${context.brandGuidelines ? '- Has brand guidelines configured' : ''}

SUGGESTED FUNCTIONS FOR THIS REQUEST:
${suggestedFunctions.map(f => `- ${f.name}: ${f.description}`).join('\n')}

INTELLIGENCE GUIDELINES:
- Always validate function parameters before execution
- Provide helpful error messages with examples when parameters are missing
- Use context to infer missing parameters when possible
- Guide users through multi-step workflows
- Offer proactive suggestions based on current context
- Be specific about what information is needed

Your goal is to be helpful, intelligent, and provide actionable assistance.`;
  }

  async addNavigationFunction() {
    aiAgentService.registerFunction('navigateToPage', this.navigateToPage.bind(this));
  }

  private async navigateToPage(params: any) {
    const validPages = [
      '/',
      '/content-builder',
      '/analytics', 
      '/solutions',
      '/settings',
      '/drafts',
      '/ai-assistant'
    ];

    if (validPages.includes(params.page)) {
      return { 
        success: true, 
        navigate: params.page,
        notification: `Navigating to ${params.page}...` 
      };
    } else {
      throw new Error(`Invalid page: ${params.page}. Valid pages: ${validPages.join(', ')}`);
    }
  }
}

export const enhancedAiAgentService = new EnhancedAIAgentService();
