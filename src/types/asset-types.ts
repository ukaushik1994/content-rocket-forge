import { ContentBrief } from './campaign-types';

export interface CampaignAsset {
  id: string;
  campaignId: string;
  type: 'blog' | 'email' | 'social-twitter' | 'social-linkedin' | 
        'social-facebook' | 'social-instagram' | 'script' | 'meme' | 
        'carousel' | 'landing-page';
  title: string;
  description: string;
  keywords: string[];
  metaTitle?: string;
  metaDescription?: string;
  targetWordCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  serpOpportunity?: number;
  estimatedTime: number; // minutes
  estimatedCost: number; // AI credits
  status: 'pending' | 'generating' | 'completed' | 'failed';
  contentBrief?: ContentBrief;
  generatedContent?: string;
  createdAt: Date;
}

export interface AssetGenerationProgress {
  total: number;
  completed: number;
  failed: number;
  currentAsset: CampaignAsset | null;
  isGenerating: boolean;
}
