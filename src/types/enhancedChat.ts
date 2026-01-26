
import { ContextualAction } from '@/services/aiService';

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'area' | 'radar' | 'funnel' | 'scatter' | 'radial' | 'composed';
  data: any[];
  categories: string[];
  title: string; // Individual chart title
  subtitle?: string; // Chart-specific context
  dataContext?: string; // Explain what this chart shows
  series?: Array<{
    dataKey: string;
    name: string;
  }>;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  height?: number;
  perspectives?: ChartPerspective; // Multi-perspective analysis of chart
  
  // Individual chart insights and actions
  chartInsights?: string[]; // Specific insights for this chart
  chartActions?: ActionableItem[]; // Actions specific to this chart
}

export interface ActionableItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
  // Enhanced fields for Phase 4
  estimatedImpact?: string; // e.g., "+15% conversions"
  timeRequired?: string; // e.g., "5 minutes", "2 hours"
  actionType?: 'navigate' | 'workflow' | 'external' | 'info';
  targetUrl?: string; // Where to navigate or external link
  icon?: string; // Lucide icon name
  prerequisites?: string[]; // ["Set up GA4", "Configure tracking"]
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

export interface ChartPerspective {
  descriptive: string;
  strategic: string;
  actionable: string[];
  analytical: string;
  comparative: string;
}

export interface GeneratedImageVisualData {
  id: string;
  url: string;
  prompt: string;
  provider?: string;
  model?: string;
  createdAt?: string;
  width?: number;
  height?: number;
}

export interface GeneratedVideoVisualData {
  id: string;
  url?: string; // Will be populated when video generation is available
  thumbnailUrl?: string;
  prompt: string;
  duration?: number;
  status: 'pending' | 'generating' | 'completed' | 'coming_soon';
  provider?: string;
  model?: string;
  createdAt?: string;
}

export interface VisualData {
  type: 'chart' | 'metrics' | 'workflow' | 'summary' | 'serp_analysis' | 'table' | 'multi_chart_analysis' | 'generated_image' | 'generated_images' | 'generated_video' | 'generated_videos' | 'queue_status' | 'campaign_dashboard';
  
  // Generated image support
  generatedImage?: GeneratedImageVisualData;
  generatedImages?: GeneratedImageVisualData[];
  
  // Generated video support
  generatedVideo?: GeneratedVideoVisualData;
  generatedVideos?: GeneratedVideoVisualData[];
  
  title?: string; // AI-generated title based on user query
  subtitle?: string; // AI-generated subtitle/description
  description?: string;
  insightTitle?: string; // Key insight headline
  
  // Multi-chart support
  charts?: ChartConfiguration[]; // Array of 2-4 charts showing different perspectives
  
  // Summary section with multiple types of insights
  summaryInsights?: {
    metricCards?: MetricCard[]; // Key stats
    bulletPoints?: string[]; // Quick insights list
    paragraphSummary?: string; // Narrative summary
    alerts?: Array<{
      type: 'success' | 'warning' | 'error';
      message: string;
    }>;
  };
  
  chartConfig?: ChartConfiguration;
  metrics?: MetricCard[];
  workflowStep?: WorkflowStep;
  serpData?: any;
  tableData?: TableData;
  actionableItems?: ActionableItem[]; // Context-specific quick actions with navigation
  deepDivePrompts?: string[]; // AI-generated follow-up questions
  chartPerspectives?: ChartPerspective; // Multi-perspective chart context
  insights?: string[]; // AI-generated insights from perspectives
  summary?: {
    title: string;
    items: Array<{
      label: string;
      value: string;
      status: 'good' | 'warning' | 'needs-attention';
    }>;
  };
  
  // Campaign-specific visualization data
  queueStatusData?: {
    campaignId: string;
    campaignName: string;
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    failedItems?: Array<{
      id: string;
      asset_type: string;
      error_message: string;
      retry_count: number;
    }>;
    estimatedCompletionMinutes: number | null;
    processingDetails?: Array<{
      id: string;
      asset_type: string;
    }>;
  };
  
  campaignDashboardData?: {
    campaign: {
      id: string;
      name: string;
      status: string;
      objective: string | null;
      timeline: string | null;
      solution_name: string | null;
    };
    queueStatus?: {
      total: number;
      pending: number;
      processing: number;
      completed: number;
      failed: number;
    };
    contentInventory?: {
      total: number;
      byStatus: Record<string, number>;
      byFormat: Record<string, number>;
    };
    performance?: {
      totalViews: number;
      totalClicks: number;
      totalConversions: number;
      engagementRate: number;
    };
    timelineHealth?: {
      status: 'on_track' | 'at_risk' | 'overdue' | 'unknown';
      completionPercentage: number;
      blockers: string[];
    };
  };
  
  // Validation metadata
  validationStatus?: {
    isValid: boolean;
    confidence: number; // 0-100
    warnings?: string[];
  };
}

export interface EnhancedChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  visualData?: VisualData;
  allVisualData?: VisualData[]; // Phase 1: Store all generated charts
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
