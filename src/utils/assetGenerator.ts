import { CampaignStrategy, ContentBrief } from '@/types/campaign-types';
import { CampaignAsset } from '@/types/asset-types';

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
        id: `${campaignId}-${formatId}-${i}`,
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
        estimatedTime: getEstimatedTime(formatId, topic),
        estimatedCost: getEstimatedCost(formatId, topic),
        status: 'pending',
        contentBrief: topic,
        createdAt: new Date(),
      });
    }
  });
  
  return assets;
};

// Base time estimates (in minutes)
const baseTimeMap: Record<string, number> = {
  'blog': 8,
  'landing-page': 10,
  'script': 6,
  'email': 4,
  'carousel': 5,
  'social-linkedin': 2,
  'social-facebook': 2,
  'social-twitter': 1,
  'social-instagram': 2,
  'meme': 1,
};

// Base cost estimates (in credits)
const baseCostMap: Record<string, number> = {
  'blog': 2,
  'landing-page': 3,
  'script': 2,
  'email': 1,
  'carousel': 2,
  'social-linkedin': 1,
  'social-facebook': 1,
  'social-twitter': 1,
  'social-instagram': 1,
  'meme': 1,
};

const getEstimatedTime = (formatId: string, brief?: ContentBrief): number => {
  let time = baseTimeMap[formatId] || 4;
  
  if (brief) {
    // Add time for longer content
    if (brief.targetWordCount) {
      if (brief.targetWordCount > 1500) time += 3;
      else if (brief.targetWordCount > 800) time += 1;
    }
    
    // Add time for keyword optimization
    if (brief.keywords && brief.keywords.length > 3) time += 1;
    
    // Add time for SEO crafting
    if (brief.metaTitle || brief.metaDescription) time += 1;
  }
  
  return time;
};

const getEstimatedCost = (formatId: string, brief?: ContentBrief): number => {
  let cost = baseCostMap[formatId] || 1;
  
  if (brief) {
    // Increase cost for longer content
    if (brief.targetWordCount) {
      const additionalCost = Math.floor(brief.targetWordCount / 800);
      cost += additionalCost;
    }
    
    // Increase cost for high SEO opportunity
    if (brief.serpOpportunity && brief.serpOpportunity > 70) cost += 1;
    
    // Difficulty multiplier
    if (brief.difficulty === 'hard') cost = Math.ceil(cost * 1.3);
    else if (brief.difficulty === 'medium') cost = Math.ceil(cost * 1.1);
  }
  
  return cost;
};

const createFallbackAsset = (
  formatId: string, 
  index: number, 
  campaignId: string
): CampaignAsset => {
  return {
    id: `${campaignId}-${formatId}-${index}`,
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
