/**
 * Content Strategy related type definitions
 */

export interface ContentGoal {
  id: string;
  type: 'awareness' | 'consideration' | 'conversion' | 'retention';
  description: string;
  metrics: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface TargetAudience {
  id: string;
  name: string;
  demographics: {
    ageRange: string;
    gender?: string;
    location?: string;
    income?: string;
  };
  psychographics: {
    interests: string[];
    painPoints: string[];
    motivations: string[];
    behaviors: string[];
  };
  contentPreferences: {
    formats: string[];
    tone: string;
    length: 'short' | 'medium' | 'long';
    complexity: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface ContentStrategy {
  id: string;
  name: string;
  objectives: ContentGoal[];
  targetAudiences: TargetAudience[];
  brandVoice: {
    tone: string[];
    personality: string[];
    doUse: string[];
    dontUse: string[];
  };
  contentPillars: {
    name: string;
    description: string;
    weight: number; // percentage
  }[];
  distributionChannels: {
    channel: string;
    priority: 'primary' | 'secondary';
    requirements: string[];
  }[];
  kpis: {
    metric: string;
    target: number;
    timeframe: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorAnalysis {
  id: string;
  competitorName: string;
  domain: string;
  strengths: string[];
  weaknesses: string[];
  contentGaps: string[];
  keywordOverlap: {
    keyword: string;
    theirRank: number;
    ourRank?: number;
    difficulty: number;
  }[];
  contentTypes: {
    type: string;
    frequency: string;
    performance: 'high' | 'medium' | 'low';
  }[];
  analyzedAt: string;
}

export interface ContentCalendar {
  id: string;
  title: string;
  contentType: string;
  targetKeywords: string[];
  targetAudience: string;
  contentPillar: string;
  status: 'planned' | 'in-progress' | 'review' | 'published';
  scheduledDate: string;
  publishedDate?: string;
  assignedTo?: string;
  estimatedEffort: number; // hours
  actualEffort?: number; // hours
  performance?: {
    views: number;
    engagement: number;
    conversions: number;
    ranking: { [keyword: string]: number };
  };
}