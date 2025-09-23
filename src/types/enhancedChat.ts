
import { ContextualAction } from '@/services/aiService';

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  height?: number;
}

export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  actions: ContextualAction[];
  progress?: {
    current: number;
    total: number;
  };
}

export interface ProgressState {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  completedSteps: string[];
}

export interface VisualData {
  type: 'chart' | 'metrics' | 'workflow' | 'summary';
  chartConfig?: ChartConfiguration;
  metrics?: MetricCard[];
  workflowStep?: WorkflowStep;
  summary?: {
    title: string;
    items: Array<{
      label: string;
      value: string;
      status: 'good' | 'warning' | 'needs-attention';
    }>;
  };
}

export interface EnhancedChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  visualData?: VisualData;
  serpData?: any[]; // Added SERP data support
  actions?: ContextualAction[];
  progressIndicator?: ProgressState;
  workflowContext?: {
    currentWorkflow?: string;
    stepData?: Record<string, any>;
  };
  isStreaming?: boolean;
  type?: 'user' | 'assistant' | 'system';
  metadata?: {
    reasoning?: string;
    confidence?: number;
    sources?: string[];
    actionResults?: any;
  };
}
