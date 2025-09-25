import { createClient } from '@supabase/supabase-js';

// Use direct Supabase client to avoid TypeScript issues with new table
const supabaseUrl = 'https://iqiundzzcepmuykcnfbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaXVuZHp6Y2VwbXV5a2NuZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTU0MTYsImV4cCI6MjA2MTc5MTQxNn0.k3PVN3ETBJ-ho4gtmTf8XisS-FbTwzTaAc62nL6cFtA';
const directSupabase = createClient(supabaseUrl, supabaseKey);

export interface ScheduledWorkflow {
  id: string;
  userId: string;
  workflowId: string;
  scheduleExpression: string; // Cron-like expression
  isActive: boolean;
  lastRun?: Date;
  nextRun: Date;
  createdAt: Date;
  metadata?: any;
}

export interface WorkflowScheduleOptions {
  scheduleExpression: string;
  timezone?: string;
  maxExecutions?: number;
  retryPolicy?: {
    maxRetries: number;
    retryDelay: number;
  };
}

/**
 * Advanced workflow scheduling service with cron-like functionality
 */
export class WorkflowSchedulerService {
  
  /**
   * Schedule a workflow for execution
   */
  static async scheduleWorkflow(
    userId: string,
    workflowId: string,
    options: WorkflowScheduleOptions
  ): Promise<ScheduledWorkflow> {
    const nextRun = this.calculateNextRun(options.scheduleExpression);
    
    const { data, error } = await directSupabase
      .from('workflow_schedules')
      .insert({
        user_id: userId,
        workflow_id: workflowId,
        schedule_expression: options.scheduleExpression,
        timezone: options.timezone || 'UTC',
        next_run: nextRun.toISOString(),
        is_active: true,
        metadata: {
          maxExecutions: options.maxExecutions,
          retryPolicy: options.retryPolicy
        }
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      workflowId: data.workflow_id,
      scheduleExpression: data.schedule_expression,
      isActive: data.is_active,
      lastRun: data.last_run ? new Date(data.last_run) : undefined,
      nextRun: new Date(data.next_run),
      createdAt: new Date(data.created_at),
      metadata: data.metadata
    };
  }

  /**
   * Get scheduled workflows for a user
   */
  static async getUserScheduledWorkflows(userId: string): Promise<ScheduledWorkflow[]> {
    const { data, error } = await directSupabase
      .from('workflow_schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('next_run', { ascending: true });

    if (error) throw error;

    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      workflowId: item.workflow_id,
      scheduleExpression: item.schedule_expression,
      isActive: item.is_active,
      lastRun: item.last_run ? new Date(item.last_run) : undefined,
      nextRun: new Date(item.next_run),
      createdAt: new Date(item.created_at),
      metadata: item.metadata
    }));
  }

  /**
   * Update workflow schedule
   */
  static async updateSchedule(
    scheduleId: string,
    options: Partial<WorkflowScheduleOptions>
  ): Promise<void> {
    const updates: any = {};
    
    if (options.scheduleExpression) {
      updates.schedule_expression = options.scheduleExpression;
      updates.next_run = this.calculateNextRun(options.scheduleExpression).toISOString();
    }
    
    if (options.timezone) {
      updates.timezone = options.timezone;
    }

    const { error } = await directSupabase
      .from('workflow_schedules')
      .update(updates)
      .eq('id', scheduleId);

    if (error) throw error;
  }

  /**
   * Cancel a scheduled workflow
   */
  static async cancelSchedule(scheduleId: string): Promise<void> {
    const { error } = await directSupabase
      .from('workflow_schedules')
      .update({ is_active: false })
      .eq('id', scheduleId);

    if (error) throw error;
  }

  /**
   * Calculate next run time based on cron expression
   */
  private static calculateNextRun(scheduleExpression: string): Date {
    const now = new Date();
    
    // Simple cron parser for common patterns
    const patterns = {
      '@daily': () => {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
      },
      '@hourly': () => {
        const nextHour = new Date(now);
        nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
        return nextHour;
      },
      '@weekly': () => {
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(0, 0, 0, 0);
        return nextWeek;
      },
      '@monthly': () => {
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
        nextMonth.setHours(0, 0, 0, 0);
        return nextMonth;
      }
    };

    // Check for predefined patterns
    if (patterns[scheduleExpression as keyof typeof patterns]) {
      return patterns[scheduleExpression as keyof typeof patterns]();
    }

    // Parse standard cron format: "minute hour day month dayOfWeek"
    const parts = scheduleExpression.trim().split(/\s+/);
    if (parts.length === 5) {
      return this.parseCronExpression(parts, now);
    }

    // Default to 1 hour from now
    const defaultNext = new Date(now);
    defaultNext.setHours(defaultNext.getHours() + 1);
    return defaultNext;
  }

  /**
   * Parse cron expression (simplified implementation)
   */
  private static parseCronExpression(parts: string[], fromDate: Date): Date {
    const [minute, hour, day, month, dayOfWeek] = parts;
    const next = new Date(fromDate);

    // Handle wildcards and specific values (simplified)
    if (minute !== '*') {
      const min = parseInt(minute);
      if (!isNaN(min)) next.setMinutes(min, 0, 0);
    }

    if (hour !== '*') {
      const hr = parseInt(hour);
      if (!isNaN(hr)) next.setHours(hr);
    }

    // If the calculated time is in the past, move to next occurrence
    if (next <= fromDate) {
      if (hour !== '*' && minute !== '*') {
        // Move to next day
        next.setDate(next.getDate() + 1);
      } else if (hour !== '*') {
        // Move to next hour
        next.setHours(next.getHours() + 1);
      } else {
        // Move to next minute
        next.setMinutes(next.getMinutes() + 1);
      }
    }

    return next;
  }

  /**
   * Get workflows due for execution
   */
  static async getWorkflowsDueForExecution(): Promise<ScheduledWorkflow[]> {
    const now = new Date().toISOString();
    
    const { data, error } = await directSupabase
      .from('workflow_schedules')
      .select('*')
      .eq('is_active', true)
      .lte('next_run', now);

    if (error) throw error;

    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      workflowId: item.workflow_id,
      scheduleExpression: item.schedule_expression,
      isActive: item.is_active,
      lastRun: item.last_run ? new Date(item.last_run) : undefined,
      nextRun: new Date(item.next_run),
      createdAt: new Date(item.created_at),
      metadata: item.metadata
    }));
  }

  /**
   * Mark workflow as executed and schedule next run
   */
  static async markWorkflowExecuted(scheduleId: string): Promise<void> {
    // Get current schedule
    const { data: schedule, error: fetchError } = await directSupabase
      .from('workflow_schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (fetchError) throw fetchError;

    // Calculate next run
    const nextRun = this.calculateNextRun(schedule.schedule_expression);

    // Update schedule
    const { error } = await directSupabase
      .from('workflow_schedules')
      .update({
        last_run: new Date().toISOString(),
        next_run: nextRun.toISOString()
      })
      .eq('id', scheduleId);

    if (error) throw error;
  }

  /**
   * Validate cron expression
   */
  static validateCronExpression(expression: string): boolean {
    const predefinedPatterns = ['@daily', '@hourly', '@weekly', '@monthly'];
    
    if (predefinedPatterns.includes(expression)) {
      return true;
    }

    // Basic validation for 5-part cron expression
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
      return false;
    }

    // Check each part (simplified validation)
    const [minute, hour, day, month, dayOfWeek] = parts;
    
    const isValidPart = (part: string, min: number, max: number) => {
      if (part === '*') return true;
      const num = parseInt(part);
      return !isNaN(num) && num >= min && num <= max;
    };

    return (
      isValidPart(minute, 0, 59) &&
      isValidPart(hour, 0, 23) &&
      isValidPart(day, 1, 31) &&
      isValidPart(month, 1, 12) &&
      isValidPart(dayOfWeek, 0, 7)
    );
  }
}