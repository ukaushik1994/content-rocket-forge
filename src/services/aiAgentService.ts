
import { supabase } from '@/integrations/supabase/client';
import { analyzeKeywordSerp } from './serpApiService';
import { sendChatRequest } from './aiService';

export interface AgentResponse {
  content: string;
  functionCalls?: FunctionCall[];
  attachments?: Attachment[];
  context?: any;
}

export interface FunctionCall {
  name: string;
  parameters: any;
  result?: any;
  status: 'pending' | 'executing' | 'completed' | 'error';
}

export interface Attachment {
  type: 'file' | 'image' | 'data';
  name: string;
  content: any;
}

export interface MessageContext {
  conversationHistory: any[];
  currentContext: any;
  userPreferences: any;
}

interface AnalyticsData {
  views?: number;
  clicks?: number;
  position?: number;
  [key: string]: any;
}

class AIAgentService {
  private availableFunctions: Map<string, Function> = new Map();
  private repositoryContext: any = null;

  constructor() {
    this.initializeFunctions();
    this.loadRepositoryContext();
  }

  private initializeFunctions() {
    // Content Creation Functions
    this.availableFunctions.set('createContent', this.createContent.bind(this));
    this.availableFunctions.set('analyzeKeyword', this.analyzeKeyword.bind(this));
    this.availableFunctions.set('generateOutline', this.generateOutline.bind(this));
    this.availableFunctions.set('optimizeContent', this.optimizeContent.bind(this));
    
    // SERP Analysis Functions
    this.availableFunctions.set('analyzeSERP', this.analyzeSERP.bind(this));
    this.availableFunctions.set('getCompetitorAnalysis', this.getCompetitorAnalysis.bind(this));
    
    // Content Management Functions
    this.availableFunctions.set('listContent', this.listContent.bind(this));
    this.availableFunctions.set('updateContent', this.updateContent.bind(this));
    this.availableFunctions.set('deleteContent', this.deleteContent.bind(this));
    this.availableFunctions.set('publishContent', this.publishContent.bind(this));
    
    // Analytics Functions
    this.availableFunctions.set('getAnalytics', this.getAnalytics.bind(this));
    this.availableFunctions.set('getPerformanceReport', this.getPerformanceReport.bind(this));
    
    // Workflow Functions
    this.availableFunctions.set('startApprovalWorkflow', this.startApprovalWorkflow.bind(this));
    this.availableFunctions.set('reviewContent', this.reviewContent.bind(this));
    
    // Solution Management Functions
    this.availableFunctions.set('createSolution', this.createSolution.bind(this));
    this.availableFunctions.set('listSolutions', this.listSolutions.bind(this));
    
    // Platform Functions
    this.availableFunctions.set('getRepositoryInfo', this.getRepositoryInfo.bind(this));
    this.availableFunctions.set('executeWorkflow', this.executeWorkflow.bind(this));
  }

  private async loadRepositoryContext() {
    // Analyze repository structure and capabilities
    this.repositoryContext = {
      features: [
        'Content Builder',
        'SERP Analysis', 
        'SEO Optimization',
        'Content Approval Workflows',
        'Analytics Dashboard',
        'Solution Management',
        'Brand Guidelines',
        'Company Management',
        'Keyword Research',
        'Content Repurposing'
      ],
      currentCapabilities: {
        contentCreation: true,
        serpAnalysis: true,
        seoOptimization: true,
        workflowManagement: true,
        analytics: true,
        userManagement: true,
        apiIntegrations: true
      },
      integrations: [
        'Supabase Database',
        'SERP API',
        'AI Services (OpenAI, etc)',
        'Analytics Services'
      ]
    };
  }

  async processMessage(message: string, context: MessageContext): Promise<AgentResponse> {
    try {
      // Analyze user intent and determine required functions
      const intent = await this.analyzeIntent(message, context);
      
      // Generate response with function calls
      const response = await this.generateResponse(intent, message, context);
      
      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      throw new Error('Failed to process message');
    }
  }

  private async analyzeIntent(message: string, context: MessageContext) {
    const systemPrompt = `You are an AI agent that can perform any action on a content platform. 

AVAILABLE CAPABILITIES:
${JSON.stringify(this.repositoryContext, null, 2)}

AVAILABLE FUNCTIONS:
${Array.from(this.availableFunctions.keys()).join(', ')}

Analyze the user's message and determine:
1. What they want to accomplish
2. Which functions to call
3. What parameters are needed
4. Any clarifying questions needed

User message: "${message}"

Respond with a JSON object containing:
{
  "intent": "description of what user wants",
  "functions": [{"name": "functionName", "parameters": {...}}],
  "needsClarity": "any clarifying questions",
  "userResponse": "conversational response to user"
}`;

    const response = await sendChatRequest('openai', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.3
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      // Fallback to text response
      return {
        intent: "general_query",
        functions: [],
        userResponse: response.choices[0].message.content
      };
    }
  }

  private async generateResponse(intent: any, originalMessage: string, context: MessageContext): Promise<AgentResponse> {
    const functionCalls: FunctionCall[] = intent.functions?.map((f: any) => ({
      name: f.name,
      parameters: f.parameters,
      status: 'pending' as const
    })) || [];

    return {
      content: intent.userResponse || "I'll help you with that. Let me process your request.",
      functionCalls,
      context: { intent, originalMessage }
    };
  }

  async executeFunction(functionName: string, parameters: any): Promise<any> {
    const func = this.availableFunctions.get(functionName);
    if (!func) {
      throw new Error(`Function ${functionName} not found`);
    }

    try {
      const result = await func(parameters);
      return result;
    } catch (error) {
      console.error(`Error executing function ${functionName}:`, error);
      throw error;
    }
  }

  // Function implementations
  private async createContent(params: any) {
    const { data, error } = await supabase
      .from('content_items')
      .insert({
        title: params.title,
        content: params.content,
        status: 'draft',
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, content: data, notification: 'Content created successfully!' };
  }

  private async analyzeKeyword(params: any) {
    const serpData = await analyzeKeywordSerp(params.keyword);
    return { success: true, data: serpData, notification: 'Keyword analysis completed!' };
  }

  private async analyzeSERP(params: any) {
    const serpData = await analyzeKeywordSerp(params.keyword, params.forceRefresh);
    return { success: true, data: serpData, notification: 'SERP analysis completed!' };
  }

  private async listContent(params: any) {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('created_at', { ascending: false })
      .limit(params.limit || 10);

    if (error) throw error;
    return { success: true, data, notification: `Found ${data.length} content items` };
  }

  private async getAnalytics(params: any) {
    const { data, error } = await supabase
      .from('content_analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(params.limit || 10);

    if (error) throw error;
    return { success: true, data, notification: 'Analytics data retrieved' };
  }

  private async createSolution(params: any) {
    const { data, error } = await supabase
      .from('solutions')
      .insert({
        name: params.name,
        features: params.features || [],
        use_cases: params.useCases || [],
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data, notification: 'Solution created successfully!' };
  }

  private async listSolutions(params: any) {
    const { data, error } = await supabase
      .from('solutions')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data, notification: `Found ${data.length} solutions` };
  }

  private async startApprovalWorkflow(params: any) {
    const { data, error } = await supabase
      .from('content_items')
      .update({ approval_status: 'pending_review' })
      .eq('id', params.contentId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data, notification: 'Approval workflow started!' };
  }

  private async getRepositoryInfo(params: any) {
    return { 
      success: true, 
      data: this.repositoryContext, 
      notification: 'Repository information retrieved' 
    };
  }

  private async generateOutline(params: any) {
    const systemPrompt = `Generate a detailed content outline for the topic: "${params.topic}"
    
    Consider:
    - Target audience: ${params.audience || 'general'}
    - Content type: ${params.type || 'blog post'}
    - SEO focus: ${params.seoFocus || 'medium'}
    
    Return a structured outline with headings and subheadings.`;

    const response = await sendChatRequest('openai', {
      messages: [{ role: 'system', content: systemPrompt }],
      temperature: 0.4
    });

    return { 
      success: true, 
      data: { outline: response.choices[0].message.content },
      notification: 'Outline generated successfully!' 
    };
  }

  private async optimizeContent(params: any) {
    const systemPrompt = `Optimize the following content for SEO and readability:
    
    Title: ${params.title}
    Content: ${params.content}
    Target keyword: ${params.keyword || 'not specified'}
    
    Provide specific optimization suggestions.`;

    const response = await sendChatRequest('openai', {
      messages: [{ role: 'system', content: systemPrompt }],
      temperature: 0.3
    });

    return { 
      success: true, 
      data: { suggestions: response.choices[0].message.content },
      notification: 'Content optimization completed!' 
    };
  }

  private async updateContent(params: any) {
    const { data, error } = await supabase
      .from('content_items')
      .update({
        title: params.title,
        content: params.content,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data, notification: 'Content updated successfully!' };
  }

  private async deleteContent(params: any) {
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', params.id);

    if (error) throw error;
    return { success: true, notification: 'Content deleted successfully!' };
  }

  private async publishContent(params: any) {
    const { data, error } = await supabase
      .from('content_items')
      .update({ 
        status: 'published',
        published_url: params.url 
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data, notification: 'Content published successfully!' };
  }

  private async getCompetitorAnalysis(params: any) {
    // This would integrate with SERP analysis to get competitor data
    const serpData = await analyzeKeywordSerp(params.keyword);
    
    const competitors = serpData?.topResults?.slice(0, 5).map(result => ({
      title: result.title,
      url: result.link,
      position: result.position,
      snippet: result.snippet
    })) || [];

    return { 
      success: true, 
      data: { competitors, keyword: params.keyword },
      notification: 'Competitor analysis completed!' 
    };
  }

  private async reviewContent(params: any) {
    const { data, error } = await supabase
      .from('content_approvals')
      .insert({
        content_id: params.contentId,
        reviewer_id: (await supabase.auth.getUser()).data.user?.id,
        status: params.decision,
        comments: params.comments
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data, notification: 'Content review submitted!' };
  }

  private async getPerformanceReport(params: any) {
    const { data, error } = await supabase
      .from('content_analytics')
      .select('*')
      .gte('created_at', params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Safely access analytics data properties
    const report = {
      totalViews: data.reduce((sum, item) => {
        const analyticsData = item.analytics_data as AnalyticsData | null;
        return sum + (analyticsData?.views || 0);
      }, 0),
      totalClicks: data.reduce((sum, item) => {
        const analyticsData = item.analytics_data as AnalyticsData | null;
        return sum + (analyticsData?.clicks || 0);
      }, 0),
      averagePosition: data.reduce((sum, item) => {
        const analyticsData = item.analytics_data as AnalyticsData | null;
        return sum + (analyticsData?.position || 0);
      }, 0) / (data.length || 1),
      contentCount: data.length
    };

    return { success: true, data: report, notification: 'Performance report generated!' };
  }

  private async executeWorkflow(params: any) {
    // Generic workflow executor - would be expanded based on specific workflow types
    const workflow = params.workflow;
    const steps = workflow.steps || [];
    
    const results = [];
    for (const step of steps) {
      if (this.availableFunctions.has(step.action)) {
        const result = await this.executeFunction(step.action, step.parameters);
        results.push(result);
      }
    }

    return { 
      success: true, 
      data: { workflow: workflow.name, results },
      notification: `Workflow "${workflow.name}" executed successfully!` 
    };
  }
}

export const aiAgentService = new AIAgentService();
