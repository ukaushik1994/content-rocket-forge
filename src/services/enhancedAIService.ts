
import { EnhancedChatMessage, VisualData, WorkflowStep } from '@/types/enhancedChat';
import { sendChatMessage, ContextualAction } from '@/services/aiService';
import { useRealAnalytics } from '@/hooks/useRealAnalytics';
import { analyzeKeywordSerp } from '@/services/serpApiService';

export interface WorkflowContext {
  currentWorkflow?: string;
  stepData?: Record<string, any>;
  userPreferences?: Record<string, any>;
}

class EnhancedAIService {
  private workflowContext: WorkflowContext = {};

  async processEnhancedMessage(
    message: string, 
    conversationHistory: EnhancedChatMessage[]
  ): Promise<EnhancedChatMessage> {
    // Analyze intent and determine if we need visual data
    const intent = this.analyzeIntent(message);
    
    // Get base AI response
    const baseResponse = await sendChatMessage(
      conversationHistory.map(msg => ({ role: msg.role, content: msg.content }))
    );

    if (!baseResponse) {
      return this.createErrorMessage();
    }

    // Enhance response based on intent
    const enhancedMessage: EnhancedChatMessage = {
      id: `enhanced-${Date.now()}`,
      role: 'assistant',
      content: baseResponse.message,
      timestamp: new Date(),
      actions: await this.generateEnhancedActions(intent, message),
    };

    // Add visual data based on intent
    if (intent.needsAnalytics) {
      enhancedMessage.visualData = await this.generateAnalyticsVisual(intent);
    }

    if (intent.isWorkflow) {
      enhancedMessage.visualData = await this.generateWorkflowVisual(intent);
      enhancedMessage.progressIndicator = this.getWorkflowProgress();
    }

    if (intent.needsSummary) {
      enhancedMessage.visualData = await this.generateSummaryVisual();
    }

    return enhancedMessage;
  }

  private analyzeIntent(message: string) {
    const lowerMessage = message.toLowerCase();
    
    return {
      needsAnalytics: lowerMessage.includes('performance') || 
                     lowerMessage.includes('analytics') || 
                     lowerMessage.includes('metrics') ||
                     lowerMessage.includes('data') ||
                     lowerMessage.includes('stats'),
      
      isWorkflow: lowerMessage.includes('keyword') ||
                  lowerMessage.includes('optimize') ||
                  lowerMessage.includes('content') ||
                  lowerMessage.includes('help me'),
      
      needsSummary: lowerMessage.includes('summary') ||
                    lowerMessage.includes('overview') ||
                    lowerMessage.includes('dashboard') ||
                    lowerMessage.includes('status'),
      
      workflowType: this.detectWorkflowType(lowerMessage)
    };
  }

  private detectWorkflowType(message: string): string {
    if (message.includes('keyword')) return 'keyword-optimization';
    if (message.includes('content')) return 'content-creation';
    if (message.includes('seo')) return 'seo-optimization';
    if (message.includes('competitor')) return 'competitive-analysis';
    return 'general';
  }

  private async generateAnalyticsVisual(intent: any): Promise<VisualData> {
    // Mock analytics data - in real implementation, fetch from useRealAnalytics
    const mockData = [
      { name: 'Mon', views: 2400, engagement: 1800, conversions: 200 },
      { name: 'Tue', views: 1398, engagement: 2200, conversions: 180 },
      { name: 'Wed', views: 9800, engagement: 2400, conversions: 300 },
      { name: 'Thu', views: 3908, engagement: 1900, conversions: 220 },
      { name: 'Fri', views: 4800, engagement: 2600, conversions: 350 },
      { name: 'Sat', views: 3800, engagement: 2100, conversions: 180 },
      { name: 'Sun', views: 4300, engagement: 2300, conversions: 240 }
    ];

    return {
      type: 'chart',
      chartConfig: {
        type: 'line',
        data: mockData,
        categories: ['views', 'engagement', 'conversions'],
        colors: ['#2563eb', '#8b5cf6', '#e11d48'],
        valueFormatter: (value: number) => value.toLocaleString(),
        height: 300
      }
    };
  }

  private async generateWorkflowVisual(intent: any): Promise<VisualData> {
    const workflowSteps = this.getWorkflowSteps(intent.workflowType);
    
    return {
      type: 'workflow',
      workflowStep: workflowSteps[0] // Return first step
    };
  }

  private async generateSummaryVisual(): Promise<VisualData> {
    return {
      type: 'summary',
      summary: {
        title: 'Platform Overview',
        items: [
          { label: 'Content Performance', value: '85%', status: 'good' },
          { label: 'SEO Score', value: '72%', status: 'warning' },
          { label: 'Keyword Rankings', value: '+12 positions', status: 'good' },
          { label: 'Content Pipeline', value: '5 drafts', status: 'needs-attention' },
          { label: 'Analytics Setup', value: 'Complete', status: 'good' }
        ]
      }
    };
  }

  private getWorkflowSteps(workflowType: string): WorkflowStep[] {
    const workflows = {
      'keyword-optimization': [
        {
          id: 'keyword-input',
          title: 'Primary Keyword Selection',
          description: 'Let\'s start by identifying your primary keyword for optimization.',
          actions: [
            { id: 'input-keyword', type: 'button', label: 'Enter Keyword', action: 'workflow:keyword-input' },
            { id: 'suggest-keywords', type: 'button', label: 'Get Suggestions', action: 'workflow:keyword-suggestions' }
          ],
          progress: { current: 1, total: 4 }
        },
        {
          id: 'serp-analysis',
          title: 'SERP Analysis',
          description: 'Analyzing search results to find optimization opportunities.',
          actions: [],
          progress: { current: 2, total: 4 }
        }
      ],
      'content-creation': [
        {
          id: 'content-type',
          title: 'Content Type Selection',
          description: 'What type of content would you like to create?',
          actions: [
            { id: 'blog-post', type: 'button', label: 'Blog Post', action: 'workflow:content-blog' },
            { id: 'landing-page', type: 'button', label: 'Landing Page', action: 'workflow:content-landing' },
            { id: 'social-post', type: 'button', label: 'Social Media', action: 'workflow:content-social' }
          ],
          progress: { current: 1, total: 3 }
        }
      ]
    };

    return workflows[workflowType as keyof typeof workflows] || [];
  }

  private async generateEnhancedActions(intent: any, message: string): Promise<ContextualAction[]> {
    const actions: ContextualAction[] = [];

    if (intent.needsAnalytics) {
      actions.push({
        id: 'view-full-analytics',
        type: 'button',
        label: 'View Full Dashboard',
        action: 'navigate:/analytics',
        variant: 'outline'
      });
    }

    if (intent.isWorkflow) {
      if (intent.workflowType === 'keyword-optimization') {
        actions.push(
          {
            id: 'start-keyword-research',
            type: 'button',
            label: 'Start Keyword Research',
            action: 'workflow:keyword-start',
            variant: 'primary'
          },
          {
            id: 'analyze-competitor',
            type: 'button',
            label: 'Competitor Analysis',
            action: 'workflow:competitor-start',
            variant: 'secondary'
          }
        );
      }
    }

    return actions;
  }

  private getWorkflowProgress() {
    // Mock progress - in real implementation, track actual workflow state
    return {
      currentStep: 1,
      totalSteps: 4,
      stepName: 'Keyword Research',
      completedSteps: []
    };
  }

  private createErrorMessage(): EnhancedChatMessage {
    return {
      id: `error-${Date.now()}`,
      role: 'assistant',
      content: 'I apologize, but I encountered an error processing your request. Please try again.',
      timestamp: new Date()
    };
  }

  updateWorkflowContext(context: Partial<WorkflowContext>) {
    this.workflowContext = { ...this.workflowContext, ...context };
  }

  getWorkflowContext(): WorkflowContext {
    return this.workflowContext;
  }
}

export const enhancedAIService = new EnhancedAIService();
