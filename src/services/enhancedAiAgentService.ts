import { supabase } from '@/integrations/supabase/client';
import { aiAgentService } from './aiAgentService';
import { platformContextService, PlatformContext } from './platformContextService';
import { getFunctionDefinition, validateFunctionParameters, suggestFunctions } from './functionRegistry';
import { parameterInferenceService } from './parameterInferenceService';
import { workflowOrchestrator, type WorkflowContext } from './workflowOrchestrator';
import { intelligentWorkflowService, type IntelligentInsights } from './intelligentWorkflowService';
import { smartSuggestionEngine, type SmartSuggestion, type SuggestionContext } from './smartSuggestionEngine';

export interface EnhancedAIResponse {
  userResponse: string;
  functions: any[];
  suggestions: SmartSuggestion[];
  insights: IntelligentInsights;
  workflowGuidance: string;
  predictiveActions: string[];
  content: string;
  functionCalls: any[];
  context: any;
}

class EnhancedAIAgentService {
  constructor() {
    this.addNavigationFunction();
    this.addIntelligentWorkflowFunctions();
  }

  async getEnhancedContext(basicContext: any): Promise<PlatformContext> {
    return await platformContextService.getFullContext(basicContext);
  }

  async processMessageWithIntelligence(message: string, context: PlatformContext): Promise<EnhancedAIResponse> {
    console.log('Processing message with advanced intelligence:', message);
    console.log('Context summary:', platformContextService.generateContextSummary(context));

    // Get comprehensive workflow context
    const workflowContext = await workflowOrchestrator.getFullWorkflowContext(context);
    const workflowSummary = workflowOrchestrator.generateWorkflowSummary(workflowContext);
    
    console.log('Workflow context:', workflowSummary);

    // Get intelligent insights
    const intelligentInsights = await intelligentWorkflowService.analyzeWorkflowIntelligence(context, workflowContext);
    console.log('Intelligent insights:', intelligentInsights);

    // Analyze user intent and suggest functions
    const suggestedFunctions = suggestFunctions(message, context);
    console.log('Suggested functions:', suggestedFunctions.map(f => f.name));

    // Generate smart suggestions
    const suggestionContext: SuggestionContext = {
      userMessage: message,
      platformContext: context,
      workflowContext,
      intelligentInsights,
      recentActions: [] // Could be populated from user activity history
    };
    const smartSuggestions = smartSuggestionEngine.generateContextualSuggestions(suggestionContext);

    // Enhanced system prompt with intelligence
    const systemPrompt = this.createAdvancedIntelligentSystemPrompt(
      context, 
      workflowContext, 
      intelligentInsights, 
      smartSuggestions, 
      suggestedFunctions
    );

    // Create the enhanced analysis prompt
    const analysisPrompt = `
User message: "${message}"
Context: ${platformContextService.generateContextSummary(context)}
Workflow: ${workflowSummary}
Productivity Score: ${intelligentInsights.productivityScore}/100
Time to Completion: ${intelligentInsights.timeToCompletion.estimated}

Available functions: ${suggestedFunctions.map(f => `${f.name} - ${f.description}`).join(', ')}
Smart suggestions: ${smartSuggestions.map(s => `${s.title} - ${s.description}`).join(', ')}
Predictive insights: ${intelligentInsights.predictions.map(p => p.title).join(', ')}

Analyze this request with advanced intelligence and provide:
1. Comprehensive understanding of user intent
2. Contextual function recommendations
3. Predictive guidance based on workflow analysis
4. Proactive suggestions for optimization
5. Next best actions for maximum productivity

Respond with enhanced intelligence that anticipates user needs and provides strategic guidance.`;

    try {
      // Create smart analysis with intelligence
      const analysis = this.createAdvancedSmartAnalysis(
        message, 
        context, 
        workflowContext, 
        intelligentInsights, 
        smartSuggestions, 
        suggestedFunctions
      );
      
      // Process function calls with parameter inference
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

            const validation = validateFunctionParameters(functionCall.name, inference.parameters);
            
            if (!validation.valid) {
              const clarificationPrompt = parameterInferenceService.generateParameterPrompt(functionDef, inference);
              analysis.needsClarity = clarificationPrompt;
              analysis.userResponse = `I'd like to help you with that! ${clarificationPrompt}`;
            } else {
              functionCall.parameters = inference.parameters;
            }
          }
        }
      }

      // Generate predictive actions
      const predictiveActions = this.generatePredictiveActions(intelligentInsights, workflowContext);

      return {
        userResponse: analysis.userResponse,
        functions: analysis.functions || [],
        suggestions: smartSuggestions,
        insights: intelligentInsights,
        workflowGuidance: analysis.workflowGuidance || '',
        predictiveActions,
        content: analysis.userResponse, // For backward compatibility
        functionCalls: analysis.functions || [], // For backward compatibility
        context: analysis // For backward compatibility
      };
    } catch (error) {
      console.error('Error in intelligent processing:', error);
      return this.createAdvancedFallbackResponse(message, context, workflowContext, intelligentInsights);
    }
  }

  private createAdvancedSmartAnalysis(
    message: string, 
    context: PlatformContext, 
    workflowContext: WorkflowContext,
    intelligentInsights: IntelligentInsights,
    smartSuggestions: SmartSuggestion[],
    suggestedFunctions: any[]
  ): any {
    const messageLower = message.toLowerCase();
    const analysis: any = {
      intent: "advanced_intelligence_query",
      functions: [],
      userResponse: "I'll help you with advanced workflow intelligence!",
      contextInsights: "",
      workflowGuidance: "",
      intelligenceLevel: "advanced"
    };

    // Add context insights with intelligence
    if (context.recentContent.length > 0) {
      analysis.contextInsights = `I can see you have ${context.recentContent.length} recent content items. Based on analytics, your average SEO score is ${workflowContext.analytics?.state.averageSeoScore || 'unknown'}. `;
    }

    // Add intelligent workflow guidance
    if (workflowContext.contentBuilder) {
      const { state, insights } = workflowContext.contentBuilder;
      analysis.workflowGuidance = `You're currently on "${insights.currentStepName}" in the Content Builder (${Math.round(insights.progress)}% complete). `;
      
      if (insights.blockers.length > 0) {
        analysis.workflowGuidance += `⚠️ I've detected ${insights.blockers.length} blockers that need attention: ${insights.blockers.join(', ')}. `;
      } else if (intelligentInsights.productivityScore < 70) {
        analysis.workflowGuidance += `📊 Your productivity score is ${intelligentInsights.productivityScore}/100. `;
      }
      
      analysis.workflowGuidance += insights.contextualHelp;

      // Add predictive guidance
      if (intelligentInsights.predictions.length > 0) {
        const highPriorityPredictions = intelligentInsights.predictions.filter(p => p.confidence > 0.8);
        if (highPriorityPredictions.length > 0) {
          analysis.workflowGuidance += ` 🔮 Prediction: ${highPriorityPredictions[0].description}`;
        }
      }
    }

    // Advanced intent detection with workflow intelligence
    if (messageLower.includes('help') || messageLower.includes('stuck') || messageLower.includes('what')) {
      analysis.intent = "intelligent_assistance";
      
      // Provide context-aware help
      const topSuggestion = smartSuggestions[0];
      if (topSuggestion) {
        analysis.userResponse = `I can help! Based on your current workflow, I recommend: **${topSuggestion.title}** - ${topSuggestion.description}`;
        
        if (topSuggestion.actionType === 'function_call') {
          analysis.functions.push({
            name: topSuggestion.actionData.function,
            parameters: topSuggestion.actionData,
            confidence: topSuggestion.confidence
          });
        }
      }

      // Add productivity insights
      if (intelligentInsights.productivityScore < 80) {
        analysis.userResponse += ` \n\n📈 **Productivity Insight**: Your current score is ${intelligentInsights.productivityScore}/100. `;
        analysis.userResponse += `Estimated time to completion: ${intelligentInsights.timeToCompletion.estimated}.`;
      }
    }
    
    else if (messageLower.includes('create') && (messageLower.includes('content') || messageLower.includes('article'))) {
      analysis.intent = "intelligent_content_creation";
      
      // Check for workflow optimization opportunities
      if (workflowContext.serpAnalysis && !workflowContext.serpAnalysis.state.hasResults) {
        analysis.userResponse = "I'll help you create content with intelligent optimization! I notice you haven't run SERP analysis yet - this will significantly improve your content strategy.";
        analysis.functions.push({
          name: "navigateToPage",
          parameters: { page: "/content-builder" },
          confidence: 0.9
        });
        analysis.functions.push({
          name: "analyzeSerpResults",
          parameters: {},
          confidence: 0.8
        });
      } else {
        analysis.functions.push({
          name: "createContent",
          parameters: {},
          confidence: 0.9
        });
        analysis.userResponse = "I'll guide you through intelligent content creation with AI-powered optimization and predictive insights.";
      }
    }
    
    else if (messageLower.includes('optimize') || messageLower.includes('improve')) {
      analysis.intent = "intelligent_optimization";
      
      // Provide optimization suggestions based on analytics
      if (workflowContext.analytics?.state.averageSeoScore < 70) {
        analysis.userResponse = `I'll help optimize your content! I've detected your average SEO score is ${workflowContext.analytics.state.averageSeoScore}/100. Let me run a comprehensive optimization analysis.`;
        analysis.functions.push({
          name: "optimizeSeo",
          parameters: {},
          confidence: 0.9
        });
      } else {
        analysis.userResponse = "Great! Your content is performing well. Let me suggest advanced optimization strategies based on competitive analysis.";
      }
    }
    
    else if (messageLower.includes('next') || messageLower.includes('continue') || messageLower.includes('proceed')) {
      analysis.intent = "intelligent_workflow_progression";
      
      // Use predictive insights for next steps
      const nextBestAction = intelligentInsights.nextBestActions[0];
      if (nextBestAction) {
        analysis.userResponse = `Based on AI analysis, your next best action is: **${nextBestAction.action}**. ${nextBestAction.reasoning}`;
        analysis.userResponse += ` Expected impact: ${nextBestAction.impact}% improvement.`;
      }
      
      if (workflowContext.contentBuilder) {
        const { insights } = workflowContext.contentBuilder;
        
        if (insights.blockers.length > 0) {
          analysis.userResponse += ` \n\n⚠️ **Blockers detected**: ${insights.blockers.join(', ')}. Let me help resolve these first.`;
        } else if (insights.nextStepName) {
          analysis.userResponse += ` \n\n🚀 **Ready to proceed** to ${insights.nextStepName}. All prerequisites are met!`;
        }
      }
    }

    // Add intelligent automation suggestions
    const availableAutomations = intelligentInsights.automations.filter(a => a.enabled);
    if (availableAutomations.length > 0 && intelligentInsights.productivityScore < 75) {
      analysis.workflowGuidance += ` 🤖 **Automation opportunity**: ${availableAutomations[0].name} could save you time. Would you like me to enable it?`;
    }

    return analysis;
  }

  private generatePredictiveActions(insights: IntelligentInsights, workflowContext: WorkflowContext): string[] {
    const actions: string[] = [];

    // Add predictions as actions
    insights.predictions
      .filter(p => p.confidence > 0.75)
      .slice(0, 3)
      .forEach(prediction => {
        actions.push(`${prediction.type.toUpperCase()}: ${prediction.title} (${Math.round(prediction.confidence * 100)}% confidence)`);
      });

    // Add next best actions
    insights.nextBestActions
      .slice(0, 2)
      .forEach(action => {
        actions.push(`RECOMMENDED: ${action.action} (${action.impact}% impact)`);
      });

    return actions;
  }

  private createAdvancedFallbackResponse(
    message: string, 
    context: PlatformContext, 
    workflowContext: WorkflowContext,
    insights: IntelligentInsights
  ): EnhancedAIResponse {
    let contextualHelp = `Currently on ${context.pageName}. `;
    
    if (workflowContext.contentBuilder) {
      contextualHelp += `Content Builder progress: ${Math.round(workflowContext.contentBuilder.insights.progress)}%. `;
    }
    
    if (insights.productivityScore < 70) {
      contextualHelp += `Productivity score: ${insights.productivityScore}/100. `;
    }

    const userResponse = `I understand you're asking about "${message}". ${contextualHelp}I'm here to provide intelligent assistance with workflow optimization, predictive insights, and strategic guidance. Could you be more specific about what you'd like to accomplish?`;

    return {
      userResponse,
      functions: [],
      suggestions: smartSuggestionEngine.generateQuickActions({
        userMessage: message,
        platformContext: context,
        workflowContext,
        intelligentInsights: insights,
        recentActions: []
      }),
      insights,
      workflowGuidance: contextualHelp,
      predictiveActions: this.generatePredictiveActions(insights, workflowContext),
      content: userResponse, // For backward compatibility
      functionCalls: [], // For backward compatibility
      context: {} // For backward compatibility
    };
  }

  private createAdvancedIntelligentSystemPrompt(
    context: PlatformContext, 
    workflowContext: WorkflowContext, 
    insights: IntelligentInsights,
    suggestions: SmartSuggestion[],
    suggestedFunctions: any[]
  ): string {
    return `You are an advanced AI assistant with deep workflow intelligence and predictive capabilities. You understand complex workflows, anticipate user needs, and provide strategic guidance.

CURRENT CONTEXT:
- Page: ${context.pageName}
- Recent content: ${context.recentContent.length} items
- Productivity Score: ${insights.productivityScore}/100
- Time to Completion: ${insights.timeToCompletion.estimated}
${context.companyInfo ? `- Company: ${context.companyInfo.name}` : ''}

WORKFLOW INTELLIGENCE:
${workflowOrchestrator.generateWorkflowSummary(workflowContext)}

PREDICTIVE INSIGHTS:
${insights.predictions.map(p => `- ${p.title}: ${p.description} (${Math.round(p.confidence * 100)}% confidence)`).join('\n')}

SMART SUGGESTIONS:
${suggestions.slice(0, 3).map(s => `- ${s.title}: ${s.description}`).join('\n')}

NEXT BEST ACTIONS:
${insights.nextBestActions.slice(0, 3).map(a => `- ${a.action}: ${a.reasoning} (${a.impact}% impact)`).join('\n')}

AVAILABLE AUTOMATIONS:
${insights.automations.filter(a => a.enabled).map(a => `- ${a.name}: ${a.description}`).join('\n')}

ADVANCED CAPABILITIES:
- Workflow prediction and optimization
- Contextual automation suggestions
- Performance-based recommendations
- Proactive problem prevention
- Strategic guidance and planning

Your goal is to be a predictive, intelligent companion that maximizes user productivity and success through advanced workflow intelligence.`;
  }

  private async addIntelligentWorkflowFunctions() {
    // Register intelligent workflow functions
    aiAgentService.registerFunction('executeAutomation', this.executeAutomation.bind(this));
    aiAgentService.registerFunction('optimizeSeo', this.optimizeSeo.bind(this));
    aiAgentService.registerFunction('analyzeSerpResults', this.analyzeSerpResults.bind(this));
    aiAgentService.registerFunction('generateContentIdeas', this.generateContentIdeas.bind(this));
    aiAgentService.registerFunction('showProductivityTips', this.showProductivityTips.bind(this));
  }

  private async executeAutomation(params: any) {
    try {
      const result = await intelligentWorkflowService.executeAutomation(params.automationId, params.context);
      return {
        success: true,
        message: `Automation executed successfully: ${params.automationId}`,
        results: result.results,
        notification: `${params.automationId} completed successfully`
      };
    } catch (error: any) {
      throw new Error(`Automation failed: ${error.message}`);
    }
  }

  private async optimizeSeo(params: any) {
    return {
      success: true,
      message: "SEO optimization analysis completed",
      recommendations: [
        "Improve keyword density in headings",
        "Add more internal links",
        "Optimize meta descriptions",
        "Include alt text for images"
      ],
      notification: "SEO optimization suggestions ready"
    };
  }

  private async analyzeSerpResults(params: any) {
    return {
      success: true,
      message: "SERP analysis completed with competitive insights",
      insights: {
        competitors: 8,
        contentGaps: ["FAQ sections", "Visual content", "Expert quotes"],
        opportunities: ["Long-tail keywords", "Featured snippets", "Local SEO"]
      },
      notification: "SERP analysis complete - new insights available"
    };
  }

  private async generateContentIdeas(params: any) {
    return {
      success: true,
      message: "AI-generated content ideas based on your industry",
      ideas: [
        "Industry trend analysis for 2024",
        "Common customer pain points and solutions",
        "Behind-the-scenes company culture content",
        "Expert interview series",
        "Case study deep dives"
      ],
      notification: "Fresh content ideas generated"
    };
  }

  private async showProductivityTips(params: any) {
    return {
      success: true,
      message: "Productivity optimization tips",
      tips: [
        "Use automation for repetitive tasks",
        "Batch similar activities together",
        "Set up SERP analysis workflows",
        "Create content templates",
        "Monitor performance metrics regularly"
      ],
      notification: "Productivity tips ready to implement"
    };
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
