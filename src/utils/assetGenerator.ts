import { CampaignStrategy, ContentBrief } from '@/types/campaign-types';
import { CampaignAsset } from '@/types/asset-types';
import { v4 as uuidv4 } from 'uuid';

export const generateAssetListFromStrategy = (
  strategy: CampaignStrategy,
  campaignId: string
): CampaignAsset[] => {
  const assets: CampaignAsset[] = [];
  
  strategy.contentMix.forEach((formatItem) => {
    const formatId = formatItem.formatId;
    const count = formatItem.count;
    const topics = formatItem.specificTopics || [];
    
    for (let i = 0; i < count; i++) {
      const topic = topics[i];
      
      if (!topic) {
        assets.push(createFallbackAsset(formatId, i, campaignId));
        continue;
      }
      
      assets.push({
        id: uuidv4(),
        campaignId,
        type: formatId as any,
        title: topic.title,
        description: topic.description,
        keywords: topic.keywords || [],
        metaTitle: topic.metaTitle,
        metaDescription: topic.metaDescription,
        targetWordCount: topic.targetWordCount,
        difficulty: topic.difficulty,
        serpOpportunity: topic.serpOpportunity,
        estimatedTime: getEstimatedTime(formatId),
        estimatedCost: getEstimatedCost(formatId),
        status: 'pending',
        contentBrief: topic,
        createdAt: new Date(),
      });
    }
  });
  
  return assets;
};

const getEstimatedTime = (formatId: string): number => {
  const timeMap: Record<string, number> = {
    'blog': 10,
    'landing-page': 12,
    'script': 8,
    'email': 5,
    'carousel': 6,
    'social-linkedin': 3,
    'social-facebook': 3,
    'social-twitter': 2,
    'social-instagram': 3,
    'meme': 2,
  };
  return timeMap[formatId] || 5;
};

const getEstimatedCost = (formatId: string): number => {
  const costMap: Record<string, number> = {
    'blog': 3,
    'landing-page': 4,
    'script': 3,
    'email': 2,
    'carousel': 2,
    'social-linkedin': 1,
    'social-facebook': 1,
    'social-twitter': 1,
    'social-instagram': 1,
    'meme': 1,
  };
  return costMap[formatId] || 2;
};

const createFallbackAsset = (
  formatId: string, 
  index: number, 
  campaignId: string
): CampaignAsset => {
  return {
    id: uuidv4(),
    campaignId,
    type: formatId as any,
    title: `${formatId.replace(/-/g, ' ')} ${index + 1}`,
    description: `Content piece #${index + 1} for ${formatId}`,
    keywords: [],
    estimatedTime: getEstimatedTime(formatId),
    estimatedCost: getEstimatedCost(formatId),
    status: 'pending',
    createdAt: new Date(),
  };
};

export const calculateAssetTotals = (assets: CampaignAsset[]) => {
  return {
    totalTime: assets.reduce((sum, a) => sum + a.estimatedTime, 0),
    totalCost: assets.reduce((sum, a) => sum + a.estimatedCost, 0),
    totalAssets: assets.length,
  };
};

export const groupAssetsByType = (assets: CampaignAsset[]) => {
  return assets.reduce((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = [];
    }
    acc[asset.type].push(asset);
    return acc;
  }, {} as Record<string, CampaignAsset[]>);
};
