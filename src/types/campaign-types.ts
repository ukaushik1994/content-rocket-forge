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
}

export interface ContentFormatCount {
  formatId: string; // matches format.id from contentFormats
  count: number;
  scheduleSuggestion?: string;
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
}
