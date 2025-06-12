
import { supabase } from '@/integrations/supabase/client';
import { aiAgentService } from './aiAgentService';
import { platformContextService, PlatformContext } from './platformContextService';
import { getFunctionDefinition, validateFunctionParameters, suggestFunctions } from './functionRegistry';
import { parameterInferenceService } from './parameterInferenceService';
import { workflowOrchestrator, type WorkflowContext } from './workflowOrchestrator';

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

    // Get comprehensive workflow context
    const workflowContext = await workflowOrchestrator.getFullWorkflowContext(context);
    const workflowSummary = workflowOrchestrator.generateWorkflowSummary(workflowContext);
    
    console.log('Workflow context:', workflowSummary);

    // Analyze user intent and suggest functions
    const suggestedFunctions = suggestFunctions(message, context);
    console.log('Suggested functions:', suggestedFunctions.map(f => f.name));

    // Enhanced system prompt with platform knowledge
    const systemPrompt = this.createIntelligentSystemPrompt(context, workflowContext, suggestedFunctions);

    // Create the analysis prompt
    const analysisPrompt = `
User message: "${message}"
Context: ${platformContextService.generateContextSummary(context)}
Workflow: ${workflowSummary}

Available functions: ${suggestedFunctions.map(f => `${f.name} - ${f.description}`).join(', ')}
Available workflow actions: ${workflowContext.availableActions.map(a => `${a.name} - ${a.description}`).join(', ')}

Analyze this request and determine:
1. What the user wants to accomplish
2. Which function(s) to call
3. What parameters are needed
4. Any missing information that needs clarification
5. Relevant workflow guidance

Respond with a JSON object containing:
{
  "intent": "description of what user wants",
  "functions": [{"name": "functionName", "parameters": {...}, "confidence": 0.8}],
  "needsClarity": "any clarifying questions",
  "userResponse": "conversational response to user with workflow context",
  "contextInsights": "relevant insights from current context",
  "workflowGuidance": "specific guidance based on current workflow state"
}`;

    try {
      // This would call the AI service - for now, let's create a smart fallback
      const analysis = this.createSmartAnalysis(message, context, workflowContext, suggestedFunctions);
      
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
      return this.createFallbackResponse(message, context, workflowContext);
    }
  }

  private createSmartAnalysis(message: string, context: PlatformContext, workflowContext: WorkflowContext, suggestedFunctions: any[]): any {
    const messageLower = message.toLowerCase();
    const analysis: any = {
      intent: "general_query",
      functions: [],
      userResponse: "I'll help you with that!",
      contextInsights: "",
      workflowGuidance: ""
    };

    // Add context insights
    if (context.recentContent.length > 0) {
      analysis.contextInsights = `I can see you have ${context.recentContent.length} recent content items. `;
    }

    // Add workflow-specific guidance
    if (workflowContext.contentBuilder) {
      const { state, insights } = workflowContext.contentBuilder;
      analysis.workflowGuidance = `You're currently on "${insights.currentStepName}" in the Content Builder (${Math.round(insights.progress)}% complete). `;
      
      if (insights.blockers.length > 0) {
        analysis.workflowGuidance += `Current blockers: ${insights.blockers.join(', ')}. `;
      }
      
      analysis.workflowGuidance += insights.contextualHelp;
    }

    // Smart intent detection and function mapping with workflow awareness
    if (messageLower.includes('create') && (messageLower.includes('content') || messageLower.includes('article'))) {
      analysis.intent = "create_content";
      analysis.functions.push({
        name: "createContent",
        parameters: {},
        confidence: 0.9
      });
      
      if (workflowContext.contentBuilder) {
        analysis.userResponse = "I'll help you create new content. Based on your current workflow progress, let me guide you through the next steps...";
      } else {
        analysis.userResponse = "I'll help you create new content. Let me take you to the Content Builder to get started.";
        analysis.functions.push({
          name: "navigateToPage",
          parameters: { page: "/content-builder" },
          confidence: 0.8
        });
      }
    }
    
    else if (messageLower.includes('analyze') || messageLower.includes('keyword') || messageLower.includes('serp')) {
      analysis.intent = "keyword_analysis";
      analysis.functions.push({
        name: "analyzeKeyword",
        parameters: {},
        confidence: 0.8
      });
      
      if (workflowContext.serpAnalysis?.state.hasResults) {
        analysis.userResponse = "I can see you have SERP analysis results. Let me help you with additional keyword analysis or guide you on using these insights.";
      } else {
        analysis.userResponse = "I'll analyze that keyword for you and provide SERP insights to help with your content strategy.";
      }
    }
    
    else if (messageLower.includes('show') || messageLower.includes('list') || messageLower.includes('my content')) {
      analysis.intent = "list_content";
      analysis.functions.push({
        name: "listContent",
        parameters: { limit: 10 },
        confidence: 0.8
      });
      
      if (workflowContext.analytics) {
        const { state } = workflowContext.analytics;
        analysis.userResponse = `Let me show you your content. You currently have ${state.totalContent} total pieces with ${state.publishedContent} published and ${state.draftContent} in draft.`;
      } else {
        analysis.userResponse = "Let me show you your content.";
      }
    }
    
    else if (messageLower.includes('help') || messageLower.includes('what') || messageLower.includes('how')) {
      analysis.intent = "workflow_help";
      
      if (workflowContext.contentBuilder) {
        const { insights } = workflowContext.contentBuilder;
        analysis.userResponse = `I can help! ${insights.contextualHelp}`;
        
        if (insights.recommendedActions.length > 0) {
          analysis.userResponse += ` Here's what I recommend: ${insights.recommendedActions.join(', ')}.`;
        }
      } else {
        analysis.userResponse = "I'm here to help with content creation, SERP analysis, analytics, and platform navigation. What would you like to work on?";
      }
    }
    
    else if (messageLower.includes('next') || messageLower.includes('continue') || messageLower.includes('proceed')) {
      analysis.intent = "workflow_progression";
      
      if (workflowContext.contentBuilder) {
        const { insights } = workflowContext.contentBuilder;
        
        if (insights.blockers.length > 0) {
          analysis.userResponse = `Before we can proceed, we need to resolve these blockers: ${insights.blockers.join(', ')}. ${insights.contextualHelp}`;
        } else if (insights.nextStepName) {
          analysis.userResponse = `Great! Let's move to the next step: ${insights.nextStepName}. ${insights.contextualHelp}`;
        } else {
          analysis.userResponse = "You're at the final step! Ready to save and publish your content.";
        }
      } else {
        analysis.userResponse = "What workflow would you like to continue? I can help with content creation, SERP analysis, or reviewing your analytics.";
      }
    }

    // Add high-priority workflow actions as recommendations
    if (workflowContext.availableActions.length > 0) {
      const highPriorityActions = workflowContext.availableActions
        .filter(action => action.priority === 'high' && action.enabled)
        .slice(0, 2);
      
      if (highPriorityActions.length > 0) {
        analysis.workflowGuidance += ` I recommend: ${highPriorityActions.map(a => a.name).join(', ')}.`;
      }
    }

    return analysis;
  }

  private createFallbackResponse(message: string, context: PlatformContext, workflowContext: WorkflowContext): any {
    let contextualHelp = `Currently on ${context.pageName}. `;
    
    if (workflowContext.contentBuilder) {
      contextualHelp += `Content Builder progress: ${Math.round(workflowContext.contentBuilder.insights.progress)}%. `;
    }
    
    if (workflowContext.analytics) {
      contextualHelp += `You have ${workflowContext.analytics.state.totalContent} content pieces. `;
    }

    return {
      intent: "general_help",
      functions: [],
      userResponse: `I understand you're asking about "${message}". ${contextualHelp}I'm here to help with content creation, SERP analysis, analytics, and platform navigation. Could you be more specific about what you'd like to accomplish?`,
      contextInsights: contextualHelp,
      workflowGuidance: workflowContext.availableActions.length > 0 
        ? `Available actions: ${workflowContext.availableActions.slice(0, 3).map(a => a.name).join(', ')}`
        : ""
    };
  }

  private createIntelligentSystemPrompt(context: PlatformContext, workflowContext: WorkflowContext, suggestedFunctions: any[]): string {
    return `You are an intelligent AI assistant for a content platform with deep workflow integration. You understand the user's current context and can guide them through complex workflows.

CURRENT CONTEXT:
- Page: ${context.pageName}
- User has ${context.recentContent.length} recent content items
- Platform capabilities: Content Builder, SERP Analysis, Analytics, Solutions Management
${context.companyInfo ? `- Company: ${context.companyInfo.name}` : ''}
${context.brandGuidelines ? '- Has brand guidelines configured' : ''}

WORKFLOW CONTEXT:
${workflowOrchestrator.generateWorkflowSummary(workflowContext)}

SUGGESTED FUNCTIONS FOR THIS REQUEST:
${suggestedFunctions.map(f => `- ${f.name}: ${f.description}`).join('\n')}

AVAILABLE WORKFLOW ACTIONS:
${workflowContext.availableActions.slice(0, 5).map(a => `- ${a.name}: ${a.description} (${a.priority} priority)`).join('\n')}

INTELLIGENCE GUIDELINES:
- Always provide workflow-aware responses that consider the user's current progress
- Guide users through multi-step processes with clear next steps
- Identify and help resolve workflow blockers
- Validate function parameters before execution
- Provide helpful error messages with examples when parameters are missing
- Use context to infer missing parameters when possible
- Offer proactive suggestions based on current workflow state
- Be specific about what information is needed and why

Your goal is to be an intelligent workflow companion that accelerates user productivity and success.`;
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
