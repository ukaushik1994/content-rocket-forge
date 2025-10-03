import { supabase } from '@/integrations/supabase/client';

export interface WorkflowAutomation {
  id?: string;
  userId?: string;
  automationName: string;
  triggerType: 'chat_action' | 'file_upload' | 'content_publish' | 'performance_threshold' | 'time_based';
  triggerConditions: Record<string, any>;
  actions: WorkflowAction[];
  executionCount: number;
  successCount: number;
  lastExecutedAt?: Date;
  isActive: boolean;
}

export interface WorkflowAction {
  type: 'create_content' | 'schedule_post' | 'send_notification' | 'update_calendar' | 'run_analysis' | 'trigger_approval';
  parameters: Record<string, any>;
  order: number;
}

export interface AutomationTrigger {
  type: string;
  data: any;
  userId: string;
  conversationId?: string;
}

export class WorkflowAutomationService {
  
  async createAutomation(automation: Omit<WorkflowAutomation, 'id' | 'executionCount' | 'successCount'>): Promise<WorkflowAutomation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workflow_automations')
      .insert({
        user_id: user.id,
        automation_name: automation.automationName,
        trigger_type: automation.triggerType,
        trigger_conditions: automation.triggerConditions as any,
        actions: automation.actions as any,
        is_active: automation.isActive
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return this.mapDatabaseToAutomation(data);
  }
  
  async getUserAutomations(userId: string): Promise<WorkflowAutomation[]> {
    const { data, error } = await supabase
      .from('workflow_automations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(this.mapDatabaseToAutomation);
  }
  
  async toggleAutomation(automationId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('workflow_automations')
      .update({ is_active: isActive })
      .eq('id', automationId);
      
    if (error) throw error;
  }
  
  async processTrigger(trigger: AutomationTrigger): Promise<void> {
    try {
      // Get all active automations for the user with matching trigger type
      const { data: automations, error } = await supabase
        .from('workflow_automations')
        .select('*')
        .eq('user_id', trigger.userId)
        .eq('trigger_type', trigger.type)
        .eq('is_active', true);
        
      if (error) throw error;
      
      // Process each matching automation
      for (const automation of automations) {
        if (this.shouldTriggerAutomation(automation, trigger)) {
          await this.executeAutomation(automation, trigger);
        }
      }
      
    } catch (error) {
      console.error('Error processing automation trigger:', error);
    }
  }
  
  private shouldTriggerAutomation(automation: any, trigger: AutomationTrigger): boolean {
    const conditions = automation.trigger_conditions;
    
    switch (automation.trigger_type) {
      case 'chat_action':
        return this.matchesChatActionConditions(conditions, trigger.data);
      case 'file_upload':
        return this.matchesFileUploadConditions(conditions, trigger.data);
      case 'performance_threshold':
        return this.matchesPerformanceConditions(conditions, trigger.data);
      default:
        return true; // Default to trigger for unhandled types
    }
  }
  
  private matchesChatActionConditions(conditions: any, data: any): boolean {
    if (conditions.actionTypes && !conditions.actionTypes.includes(data.actionType)) {
      return false;
    }
    
    if (conditions.keywords) {
      const hasKeyword = conditions.keywords.some((keyword: string) => 
        data.message?.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }
    
    return true;
  }
  
  private matchesFileUploadConditions(conditions: any, data: any): boolean {
    if (conditions.fileTypes && !conditions.fileTypes.includes(data.fileType)) {
      return false;
    }
    
    if (conditions.minSize && data.fileSize < conditions.minSize) {
      return false;
    }
    
    return true;
  }
  
  private matchesPerformanceConditions(conditions: any, data: any): boolean {
    if (conditions.metric && conditions.threshold) {
      const metricValue = data.metrics[conditions.metric];
      const threshold = conditions.threshold;
      
      switch (conditions.operator) {
        case 'greater_than':
          return metricValue > threshold;
        case 'less_than':
          return metricValue < threshold;
        case 'equals':
          return metricValue === threshold;
        default:
          return false;
      }
    }
    
    return false;
  }
  
  private async executeAutomation(automation: any, trigger: AutomationTrigger): Promise<void> {
    try {
      const actions = automation.actions.sort((a: WorkflowAction, b: WorkflowAction) => a.order - b.order);
      
      for (const action of actions) {
        await this.executeAction(action, trigger, automation);
      }
      
      // Update execution stats
      await supabase
        .from('workflow_automations')
        .update({
          execution_count: automation.execution_count + 1,
          success_count: automation.success_count + 1,
          last_executed_at: new Date().toISOString()
        })
        .eq('id', automation.id);
        
    } catch (error) {
      console.error('Error executing automation:', error);
      
      // Update only execution count on failure
      await supabase
        .from('workflow_automations')
        .update({
          execution_count: automation.execution_count + 1,
          last_executed_at: new Date().toISOString()
        })
        .eq('id', automation.id);
    }
  }
  
  private async executeAction(action: WorkflowAction, trigger: AutomationTrigger, automation: any): Promise<void> {
    switch (action.type) {
      case 'create_content':
        await this.executeCreateContentAction(action, trigger);
        break;
      case 'schedule_post':
        await this.executeSchedulePostAction(action, trigger);
        break;
      case 'send_notification':
        await this.executeSendNotificationAction(action, trigger);
        break;
      case 'update_calendar':
        await this.executeUpdateCalendarAction(action, trigger);
        break;
      case 'run_analysis':
        await this.executeRunAnalysisAction(action, trigger);
        break;
      case 'trigger_approval':
        await this.executeTriggerApprovalAction(action, trigger);
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }
  
  private async executeCreateContentAction(action: WorkflowAction, trigger: AutomationTrigger): Promise<void> {
    // Create content item based on trigger data
    // Extract keywords from automation parameters (if provided)
    const keywords = action.parameters.keywords || [];
    const mainKeyword = action.parameters.mainKeyword || keywords[0] || null;
    const secondaryKeywords = action.parameters.secondaryKeywords || keywords.slice(1) || [];
    
    const contentData = {
      title: action.parameters.titleTemplate || 'Auto-generated Content',
      content_type: action.parameters.contentType || 'blog',
      status: action.parameters.initialStatus || 'draft',
      user_id: trigger.userId,
      keywords: keywords,
      metadata: {
        mainKeyword: mainKeyword,
        secondaryKeywords: secondaryKeywords
      }
    };
    
    await supabase.from('content_items').insert(contentData);
  }
  
  private async executeSchedulePostAction(action: WorkflowAction, trigger: AutomationTrigger): Promise<void> {
    // Schedule content in calendar
    const scheduleDate = new Date();
    scheduleDate.setDate(scheduleDate.getDate() + (action.parameters.daysFromNow || 1));
    
    const calendarData = {
      title: action.parameters.title || 'Automated Post',
      scheduled_date: scheduleDate.toISOString().split('T')[0],
      content_type: action.parameters.contentType || 'blog',
      status: 'planning',
      user_id: trigger.userId
    };
    
    await supabase.from('content_calendar').insert(calendarData);
  }
  
  private async executeSendNotificationAction(action: WorkflowAction, trigger: AutomationTrigger): Promise<void> {
    // Create dashboard notification
    const notificationData = {
      user_id: trigger.userId,
      type: 'automation',
      title: action.parameters.title || 'Automation Triggered',
      message: action.parameters.message || 'An automation has been executed',
      status: 'info',
      is_read: false
    };
    
    await supabase.from('dashboard_alerts').insert(notificationData);
  }
  
  private async executeUpdateCalendarAction(action: WorkflowAction, trigger: AutomationTrigger): Promise<void> {
    // Update existing calendar items or create new ones
    console.log('Updating calendar based on automation trigger');
  }
  
  private async executeRunAnalysisAction(action: WorkflowAction, trigger: AutomationTrigger): Promise<void> {
    // Trigger analysis via enhanced AI chat
    await supabase.functions.invoke('enhanced-ai-chat', {
      body: {
        message: action.parameters.analysisPrompt || 'Run automated analysis',
        type: 'automation_analysis',
        metadata: {
          automationId: trigger.data.automationId,
          triggerData: trigger.data
        }
      }
    });
  }
  
  private async executeTriggerApprovalAction(action: WorkflowAction, trigger: AutomationTrigger): Promise<void> {
    // Create approval request
    if (trigger.data.contentId) {
      const approvalData = {
        content_id: trigger.data.contentId,
        reviewer_id: action.parameters.reviewerId || trigger.userId,
        status: 'pending_review',
        priority: action.parameters.priority || 'medium'
      };
      
      await supabase.from('content_approvals').insert(approvalData);
    }
  }
  
  private mapDatabaseToAutomation(data: any): WorkflowAutomation {
    return {
      id: data.id,
      userId: data.user_id,
      automationName: data.automation_name,
      triggerType: data.trigger_type,
      triggerConditions: (typeof data.trigger_conditions === 'object' && data.trigger_conditions) || {},
      actions: Array.isArray(data.actions) ? data.actions as WorkflowAction[] : [],
      executionCount: data.execution_count || 0,
      successCount: data.success_count || 0,
      lastExecutedAt: data.last_executed_at ? new Date(data.last_executed_at) : undefined,
      isActive: data.is_active
    };
  }
  
  // Predefined automation templates
  async createChatOptimizationAutomation(userId: string): Promise<WorkflowAutomation> {
    return this.createAutomation({
      automationName: 'Smart Chat Optimization',
      triggerType: 'chat_action',
      triggerConditions: {
        actionTypes: ['optimize-workflow', 'generate-summary'],
        keywords: ['optimize', 'improve', 'enhance']
      },
      actions: [
        {
          type: 'run_analysis',
          parameters: {
            analysisPrompt: 'Analyze the conversation and provide optimization recommendations'
          },
          order: 1
        },
        {
          type: 'send_notification',
          parameters: {
            title: 'Optimization Complete',
            message: 'Chat analysis and optimization recommendations are ready'
          },
          order: 2
        }
      ],
      isActive: true
    });
  }
  
  async createFileAnalysisAutomation(userId: string): Promise<WorkflowAutomation> {
    return this.createAutomation({
      automationName: 'Automatic File Analysis',
      triggerType: 'file_upload',
      triggerConditions: {
        fileTypes: ['application/pdf', 'text/plain', 'application/msword']
      },
      actions: [
        {
          type: 'run_analysis',
          parameters: {
            analysisPrompt: 'Perform comprehensive analysis of the uploaded file'
          },
          order: 1
        },
        {
          type: 'create_content',
          parameters: {
            titleTemplate: 'Analysis: {filename}',
            contentType: 'analysis',
            initialStatus: 'draft'
          },
          order: 2
        }
      ],
      isActive: true
    });
  }
}

export const workflowAutomationService = new WorkflowAutomationService();