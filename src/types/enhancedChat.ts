
import { ContextualAction } from '@/services/aiService';

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  categories: string[];
  series?: Array<{
    dataKey: string;
    name: string;
  }>;
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
  // Enhanced workflow progress support
  workflowTitle?: string;
  isActive?: boolean;
  progress?: number;
  steps?: Array<{
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'active' | 'completed' | 'error';
    duration?: number;
    result?: any;
  }>;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  title?: string;
  caption?: string;
}

export interface VisualData {
  type: 'chart' | 'metrics' | 'workflow' | 'summary' | 'serp_analysis' | 'table';
  chartConfig?: ChartConfiguration;
  metrics?: MetricCard[];
  workflowStep?: WorkflowStep;
  serpData?: any; // Add SERP data support
  tableData?: TableData;
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
  visualData?: VisualData | VisualData[]; // Support multiple charts per message
  serpData?: any[]; // Added SERP data support
  actions?: ContextualAction[];
  progressIndicator?: ProgressState;
  workflowContext?: {
    currentWorkflow?: string;
    stepData?: Record<string, any>;
  };
  isStreaming?: boolean;
  type?: 'user' | 'assistant' | 'system';
  messageStatus?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  readBy?: string[];
  metadata?: {
    reasoning?: string;
    confidence?: number;
    sources?: string[];
    actionResults?: any;
  };
}
