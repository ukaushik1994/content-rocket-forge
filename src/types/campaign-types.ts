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

export interface CampaignInput {
  idea: string;
  targetAudience?: string;
  goal?: CampaignGoal;
  timeline?: CampaignTimeline;
  useSerpData?: boolean;
  solutionId?: string; // Selected solution to promote
}
