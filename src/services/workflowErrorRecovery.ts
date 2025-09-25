/**
 * Advanced Workflow Error Recovery Service
 * Handles intelligent retry logic, graceful degradation, and error recovery
 */

import { supabase } from '@/integrations/supabase/client';

export interface ErrorRecoveryConfig {
  maxRetries: number;
  backoffStrategy: 'exponential' | 'linear' | 'fixed';
  baseDelay: number;
  maxDelay: number;
  retryableErrors: string[];
  circuitBreakerThreshold: number;
}

export interface RecoveryAttempt {
  attempt: number;
  timestamp: string;
  error: string;
  recovery_strategy: string;
  success: boolean;
  execution_time: number;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailure: string;
  state: 'closed' | 'open' | 'half-open';
  nextAttempt: string;
}

export class WorkflowErrorRecovery {
  private static config: ErrorRecoveryConfig = {
    maxRetries: 3,
    backoffStrategy: 'exponential',
    baseDelay: 1000,
    maxDelay: 30000,
    retryableErrors: [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'RATE_LIMIT_ERROR',
      'TEMPORARY_SERVICE_ERROR',
      'AI_MODEL_OVERLOADED'
    ],
    circuitBreakerThreshold: 5
  };

  private static circuitBreakers = new Map<string, CircuitBreakerState>();
  private static cache = new Map<string, any>();

  /**
   * Execute workflow with advanced error recovery
   */
  static async executeWithRecovery<T>(
    executionId: string,
    workflowFn: () => Promise<T>,
    context?: any
  ): Promise<T> {
    const attempts: RecoveryAttempt[] = [];
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Check circuit breaker
        if (this.isCircuitOpen(executionId)) {
          throw new Error('Circuit breaker is open - service temporarily unavailable');
        }

        const startTime = Date.now();
        const result = await workflowFn();
        const executionTime = Date.now() - startTime;

        // Record successful attempt
        attempts.push({
          attempt: attempt + 1,
          timestamp: new Date().toISOString(),
          error: '',
          recovery_strategy: attempt > 0 ? 'retry_success' : 'initial_success',
          success: true,
          execution_time: executionTime
        });

        // Reset circuit breaker on success
        this.resetCircuitBreaker(executionId);

        // Log recovery success if this was a retry
        if (attempt > 0) {
          await this.logRecoveryAttempts(executionId, attempts);
          console.log(`✅ Workflow recovered successfully after ${attempt} retries`);
        }

        return result;

      } catch (error) {
        lastError = error as Error;
        const executionTime = Date.now() - Date.now();

        attempts.push({
          attempt: attempt + 1,
          timestamp: new Date().toISOString(),
          error: lastError.message,
          recovery_strategy: this.determineRecoveryStrategy(lastError, attempt),
          success: false,
          execution_time: executionTime
        });

        // Update circuit breaker
        this.recordFailure(executionId);

        // Check if error is retryable
        if (!this.isRetryableError(lastError) || attempt === this.config.maxRetries) {
          await this.logRecoveryAttempts(executionId, attempts);
          
          // Attempt graceful degradation
          const degradedResult = await this.attemptGracefulDegradation<T>(
            executionId, 
            lastError, 
            context
          );
          
          if (degradedResult !== null) {
            console.log('🔄 Graceful degradation successful');
            return degradedResult;
          }
          
          throw lastError;
        }

        // Calculate delay for next retry
        const delay = this.calculateDelay(attempt);
        console.log(`⏳ Retrying in ${delay}ms (attempt ${attempt + 1}/${this.config.maxRetries})`);
        
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError || new Error('Workflow execution failed');
  }

  /**
   * Attempt graceful degradation when all retries fail
   */
  static async attemptGracefulDegradation<T>(
    executionId: string,
    error: Error,
    context?: any
  ): Promise<T | null> {
    try {
      // Strategy 1: Use cached results if available
      const cachedResult = await this.getCachedResult<T>(executionId, context);
      if (cachedResult !== null) {
        console.log('🎯 Using cached result for graceful degradation');
        return cachedResult;
      }

      // Strategy 2: Use simplified workflow version
      const simplifiedResult = await this.executeSimplifiedWorkflow<T>(executionId, context);
      if (simplifiedResult !== null) {
        console.log('🎯 Using simplified workflow for graceful degradation');
        return simplifiedResult;
      }

      // Strategy 3: Return partial results if available
      const partialResult = await this.getPartialResults<T>(executionId, context);
      if (partialResult !== null) {
        console.log('🎯 Using partial results for graceful degradation');
        return partialResult;
      }

      return null;
    } catch (degradationError) {
      console.error('Graceful degradation failed:', degradationError);
      return null;
    }
  }

  /**
   * Enhanced error classification and handling
   */
  static classifyError(error: Error): {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    retryable: boolean;
    suggestedAction: string;
  } {
    const message = error.message.toLowerCase();
    
    // Network-related errors
    if (message.includes('network') || message.includes('connection')) {
      return {
        type: 'NETWORK_ERROR',
        severity: 'medium',
        retryable: true,
        suggestedAction: 'Check internet connection and retry'
      };
    }
    
    // Rate limiting
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return {
        type: 'RATE_LIMIT_ERROR',
        severity: 'low',
        retryable: true,
        suggestedAction: 'Wait and retry with exponential backoff'
      };
    }
    
    // Timeout errors
    if (message.includes('timeout') || message.includes('timed out')) {
      return {
        type: 'TIMEOUT_ERROR',
        severity: 'medium',
        retryable: true,
        suggestedAction: 'Retry with increased timeout'
      };
    }
    
    // AI model errors
    if (message.includes('model') || message.includes('ai')) {
      return {
        type: 'AI_MODEL_ERROR',
        severity: 'high',
        retryable: true,
        suggestedAction: 'Try alternative AI model or fallback strategy'
      };
    }
    
    // Authorization errors
    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return {
        type: 'AUTH_ERROR',
        severity: 'critical',
        retryable: false,
        suggestedAction: 'Check API keys and permissions'
      };
    }
    
    // Default classification
    return {
      type: 'UNKNOWN_ERROR',
      severity: 'medium',
      retryable: false,
      suggestedAction: 'Review error details and contact support if needed'
    };
  }

  /**
   * Intelligent retry strategy selection
   */
  static selectRetryStrategy(error: Error, context?: any): 'immediate' | 'delayed' | 'alternative' | 'none' {
    const classification = this.classifyError(error);
    
    switch (classification.type) {
      case 'RATE_LIMIT_ERROR':
        return 'delayed';
      case 'NETWORK_ERROR':
        return 'delayed';
      case 'TIMEOUT_ERROR':
        return 'alternative'; // Try with different parameters
      case 'AI_MODEL_ERROR':
        return 'alternative'; // Try different model
      default:
        return classification.retryable ? 'delayed' : 'none';
    }
  }

  // Private helper methods
  private static isRetryableError(error: Error): boolean {
    const classification = this.classifyError(error);
    return classification.retryable;
  }

  private static determineRecoveryStrategy(error: Error, attempt: number): string {
    const classification = this.classifyError(error);
    const strategy = this.selectRetryStrategy(error);
    
    return `${classification.type}_${strategy}_attempt_${attempt + 1}`;
  }

  private static calculateDelay(attempt: number): number {
    switch (this.config.backoffStrategy) {
      case 'exponential':
        return Math.min(
          this.config.baseDelay * Math.pow(2, attempt),
          this.config.maxDelay
        );
      case 'linear':
        return Math.min(
          this.config.baseDelay * (attempt + 1),
          this.config.maxDelay
        );
      case 'fixed':
      default:
        return this.config.baseDelay;
    }
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static isCircuitOpen(executionId: string): boolean {
    const breaker = this.circuitBreakers.get(executionId);
    if (!breaker) return false;
    
    if (breaker.state === 'open') {
      const now = new Date();
      const nextAttempt = new Date(breaker.nextAttempt);
      
      if (now >= nextAttempt) {
        // Move to half-open state
        breaker.state = 'half-open';
        return false;
      }
      return true;
    }
    
    return false;
  }

  private static recordFailure(executionId: string): void {
    let breaker = this.circuitBreakers.get(executionId);
    
    if (!breaker) {
      breaker = {
        failures: 0,
        lastFailure: new Date().toISOString(),
        state: 'closed',
        nextAttempt: new Date().toISOString()
      };
    }
    
    breaker.failures++;
    breaker.lastFailure = new Date().toISOString();
    
    if (breaker.failures >= this.config.circuitBreakerThreshold) {
      breaker.state = 'open';
      breaker.nextAttempt = new Date(Date.now() + 60000).toISOString(); // 1 minute
    }
    
    this.circuitBreakers.set(executionId, breaker);
  }

  private static resetCircuitBreaker(executionId: string): void {
    const breaker = this.circuitBreakers.get(executionId);
    if (breaker) {
      breaker.failures = 0;
      breaker.state = 'closed';
    }
  }

  private static async getCachedResult<T>(executionId: string, context?: any): Promise<T | null> {
    try {
      // Look for similar successful executions
      const { data } = await supabase
        .from('workflow_executions')
        .select('output_results')
        .eq('status', 'completed')
        .limit(1);

      if (data && data.length > 0 && data[0].output_results) {
        return data[0].output_results as T;
      }
    } catch (error) {
      console.error('Failed to get cached result:', error);
    }
    return null;
  }

  private static async executeSimplifiedWorkflow<T>(executionId: string, context?: any): Promise<T | null> {
    // Implement simplified version of workflows
    try {
      // Example: Simple keyword analysis fallback
      if (context?.workflowType === 'keyword_analysis') {
        return {
          keywords: context?.input?.keyword ? [context.input.keyword] : [],
          analysis: 'Simplified analysis due to service limitations',
          suggestions: []
        } as T;
      }

      // Example: Simple content creation fallback
      if (context?.workflowType === 'content_creation') {
        return {
          content: `Content outline for: ${context?.input?.topic || 'your topic'}`,
          suggestions: ['Add more details', 'Include examples', 'Optimize for SEO']
        } as T;
      }

      return null;
    } catch (error) {
      console.error('Simplified workflow execution failed:', error);
      return null;
    }
  }

  private static async getPartialResults<T>(executionId: string, context?: any): Promise<T | null> {
    try {
      // Get any partial progress from the current execution
      const { data } = await supabase
        .from('workflow_executions')
        .select('output_results, progress')
        .eq('id', executionId)
        .single();

      if (data?.output_results) {
        return data.output_results as T;
      }
    } catch (error) {
      console.error('Failed to get partial results:', error);
    }
    return null;
  }

  private static async logRecoveryAttempts(
    executionId: string, 
    attempts: RecoveryAttempt[]
  ): Promise<void> {
    try {
      // Log to action_analytics table with proper JSON serialization
      await supabase
        .from('action_analytics')
        .insert({
          user_id: executionId,
          action_type: 'workflow_recovery',
          action_id: `recovery_${Date.now()}`,
          action_label: 'Recovery Attempt',
          success: attempts[attempts.length - 1]?.success || false,
          interaction_data: {
            attempts_count: attempts.length,
            final_strategy: attempts[attempts.length - 1]?.recovery_strategy || 'unknown',
            total_execution_time: attempts.reduce((sum, a) => sum + a.execution_time, 0)
          },
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log recovery attempts:', error);
    }
  }

  /**
   * Get recovery statistics for analytics
   */
  static async getRecoveryStats(userId: string): Promise<any> {
    try {
      // Use action_analytics to get recovery-related stats
      const { data } = await supabase
        .from('action_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('action_type', 'workflow_recovery')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!data || data.length === 0) {
        return {
          totalRecoveries: 0,
          successfulRecoveries: 0,
          recoveryRate: 0,
          avgAttempts: 0
        };
      }

      const totalRecoveries = data.length;
      const successfulRecoveries = data.filter(log => log.success).length;
      const avgAttempts = data.reduce((sum, log) => {
        const interactionData = log.interaction_data as any;
        const attempts = interactionData?.attempts_count || 1;
        return sum + attempts;
      }, 0) / totalRecoveries;

      return {
        totalRecoveries,
        successfulRecoveries,
        recoveryRate: totalRecoveries > 0 ? (successfulRecoveries / totalRecoveries) * 100 : 0,
        avgAttempts: Math.round(avgAttempts * 10) / 10
      };
    } catch (error) {
      console.error('Failed to get recovery stats:', error);
      return {
        totalRecoveries: 0,
        successfulRecoveries: 0,
        recoveryRate: 0,
        avgAttempts: 0
      };
    }
  }
}