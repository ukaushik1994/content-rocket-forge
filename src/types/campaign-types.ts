// Campaign strategy types

export interface CampaignStrategy {
  id: string;
  title: string;
  description: string;
  contentMix: ContentFormatCount[];
  estimatedReach?: string;
  timeline?: string;
  targetAudience?: string;
  postingSchedule?: PostingSchedule[];
  
  // Enhanced fields for rich display
  strategyScore?: number; // 0-100 AI confidence
  keyStrengths?: string[]; // 3-5 key advantages
  expectedEngagement?: 'low' | 'medium' | 'high';
  solutionAlignment?: number; // 0-100 how well it promotes solution
  competitorDifferentiation?: string; // How it stands out
  milestones?: Array<{
    week: number;
    description: string;
    contentTypes: string[];
  }>;
  expectedMetrics?: {
    impressions: { min: number; max: number };
    engagement: { min: number; max: number };
    conversions?: { min: number; max: number };
  };
  contentCategories?: Record<string, number>; // Group by Social, Video, Blog, etc.
  
  // NEW: Aggregate effort metrics
  totalEffort?: {
    hours: number;
    complexity: 'beginner' | 'skilled' | 'expert';
    workflowOrder: string[]; // Format IDs in recommended order
  };
  
  // NEW: Audience intelligence
  audienceIntelligence?: {
    personas: string[];
    industrySegments: string[];
    painPoints: string[];
    purchaseMotivations: string[];
    messagingAngle: string;
  };
  
  // NEW: SEO intelligence (aggregated)
  seoIntelligence?: {
    primaryKeyword: string;
    secondaryKeywords: string[];
    avgRankingDifficulty: 'low' | 'medium' | 'high';
    expectedSeoImpact: string;
    briefTemplatesAvailable: number;
  };
  
  // NEW: Distribution strategy
  distributionStrategy?: {
    channels: string[];
    postingCadence: string;
    bestDaysAndTimes: string[];
    toneAndMessaging: string;
    estimatedTrafficLift: string;
  };
  
  // NEW: Asset requirements
  assetRequirements?: {
    copyNeeds: string[];
    visualNeeds: string[];
    ctaSuggestions: string[];
    targetUrls: string[];
  };
  
  // NEW: Optional add-ons
  optionalAddons?: {
    contentCalendar: boolean;
    draftCopies: boolean;
    fullSeoBriefs: boolean;
    landingPageCopy: boolean;
    emailSequences: boolean;
    exportOptions: string[];
  };
  
  // NEW: Complete campaign management fields
  campaignBudget?: {
    contentCreation: number;
    paidPromotion: number;
    tools: number;
    total: number;
  };
  
  expectedROI?: {
    investment: number;
    projectedRevenue: number;
    roi: number;
    costPerLead: number;
    breakEvenPoint: string;
  };
  
  teamRequirements?: {
    roles: Array<{
      role: string;
      hours: number;
      tasks: string[];
    }>;
    approvalWorkflow: Array<{
      stage: string;
      approver: string;
      sla: string;
    }>;
  };
  
  riskManagement?: {
    complianceChecklist: string[];
    contingencyPlan: string;
    competitorResponse: string;
  };
  
  analyticsSetup?: {
    kpis: string[];
    dashboardTools: string[];
    reportingFrequency: string;
  };
  
  contentBriefs?: Array<{
    formatId: string;
    pieceIndex: number;
    title: string;
    description: string;
    keywords: string[];
    metaTitle: string;
    metaDescription: string;
    targetWordCount: number;
    difficulty: 'easy' | 'medium' | 'hard';
    serpOpportunity: number;
    ctaText: string;
    publishDate: string;
    utmParams: any;
  }>;
}

export interface ContentBrief {
  title: string;
  description: string;
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
  targetWordCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  serpOpportunity: number; // 0-100
}

export interface ContentFormatCount {
  formatId: string; // matches format.id from contentFormats
  count: number;
  scheduleSuggestion?: string;
  frequency?: string; // "3x weekly", "Daily", etc.
  bestTimes?: string[]; // ["Monday 9am", "Thursday 2pm"]
  estimatedEffort?: string; // "2 hours per piece"
  seoPotential?: 'high' | 'medium' | 'low';
  specificTopics?: ContentBrief[]; // Detailed content briefs
}

export interface PostingSchedule {
  formatId: string;
  frequency: string; // e.g., "3x weekly", "Daily", "Bi-weekly"
  platform?: string;
  bestTimes?: string[];
}

export type CampaignGoal = 'awareness' | 'conversion' | 'engagement' | 'education';
export type CampaignTimeline = '1-week' | '2-week' | '4-week' | 'ongoing';

export interface CampaignStrategySummary {
  id: string;
  title: string; // Short, catchy title (5-8 words max)
  description: string; // 1-2 sentences max
  contentMix: Array<{
    formatId: string;
    count: number;
  }>;
  expectedOutcome: string; // What it might achieve (1 sentence)
  focus: 'awareness' | 'conversion' | 'engagement' | 'education'; // Primary focus
  effortLevel: 'low' | 'medium' | 'high';
}

export type CampaignStatus = 
  | 'draft'       // Just created, no strategy yet
  | 'planned'     // Strategy generated, not started
  | 'active'      // Assets being generated
  | 'completed'   // All assets generated
  | 'archived';   // User archived it

export interface CampaignInput {
  idea: string;
  targetAudience?: string;
  goal?: CampaignGoal;
  timeline?: CampaignTimeline;
  useSerpData?: boolean;
  solutionId?: string; // Selected solution to promote
  platformPreferences?: Record<string, number>; // User-specified platform quantities
}

export interface GeneratedContent {
  id: string;
  title: string;
  content: string;
  formatId: string;
  status: 'generating' | 'ready' | 'error';
  brief: ContentBrief;
  wordCount: number;
  seoScore?: number;
  createdAt: Date;
  error?: string;
}
