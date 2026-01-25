import { CampaignStrategy, ContentFormatCount, ContentBrief } from '@/types/campaign-types';

interface NormalizationLog {
  field: string;
  issue: string;
  correction: string;
  originalValue: any;
  correctedValue: any;
}

const normalizationLogs: NormalizationLog[] = [];

function logNormalization(log: NormalizationLog) {
  normalizationLogs.push(log);
  console.warn(`[Normalizer] ${log.field}: ${log.issue} → ${log.correction}`);
}

/**
 * Ensure a value is an array
 */
function ensureArray(value: any, fieldName: string): any[] {
  if (Array.isArray(value)) return value;
  
  if (typeof value === 'string') {
    logNormalization({
      field: fieldName,
      issue: 'String instead of array',
      correction: 'Wrapped in array',
      originalValue: value,
      correctedValue: [value],
    });
    return [value];
  }
  
  if (typeof value === 'object' && value !== null) {
    const arrayValue = Object.values(value).filter(v => v != null);
    logNormalization({
      field: fieldName,
      issue: 'Object instead of array',
      correction: 'Extracted values into array',
      originalValue: value,
      correctedValue: arrayValue,
    });
    return arrayValue;
  }
  
  if (value === undefined || value === null) {
    logNormalization({
      field: fieldName,
      issue: 'Undefined/null value',
      correction: 'Defaulted to empty array',
      originalValue: value,
      correctedValue: [],
    });
    return [];
  }
  
  return [];
}

/**
 * Ensure a value is a string
 */
function ensureString(value: any, fieldName: string, fallback: string = ''): string {
  if (typeof value === 'string') return value;
  
  if (Array.isArray(value)) {
    const stringValue = value.join(', ');
    logNormalization({
      field: fieldName,
      issue: 'Array instead of string',
      correction: 'Joined array elements',
      originalValue: value,
      correctedValue: stringValue,
    });
    return stringValue;
  }
  
  if (typeof value === 'object' && value !== null) {
    const stringValue = JSON.stringify(value);
    logNormalization({
      field: fieldName,
      issue: 'Object instead of string',
      correction: 'Stringified object',
      originalValue: value,
      correctedValue: stringValue,
    });
    return stringValue;
  }
  
  if (value === undefined || value === null) {
    logNormalization({
      field: fieldName,
      issue: 'Undefined/null value',
      correction: `Defaulted to "${fallback}"`,
      originalValue: value,
      correctedValue: fallback,
    });
    return fallback;
  }
  
  return String(value);
}

/**
 * Ensure a value is a number
 */
function ensureNumber(value: any, fieldName: string, fallback: number): number {
  if (typeof value === 'number' && !isNaN(value)) return value;
  
  const parsed = Number(value);
  if (!isNaN(parsed)) {
    if (value !== parsed) {
      logNormalization({
        field: fieldName,
        issue: 'Non-number value',
        correction: 'Parsed to number',
        originalValue: value,
        correctedValue: parsed,
      });
    }
    return parsed;
  }
  
  logNormalization({
    field: fieldName,
    issue: 'Invalid number',
    correction: `Defaulted to ${fallback}`,
    originalValue: value,
    correctedValue: fallback,
  });
  return fallback;
}

/**
 * Normalize AssetRequirements
 */
function normalizeAssetRequirements(raw: any): CampaignStrategy['assetRequirements'] {
  if (!raw) return undefined;
  
  return {
    copyNeeds: ensureArray(raw.copyNeeds, 'assetRequirements.copyNeeds'),
    visualNeeds: ensureArray(raw.visualNeeds, 'assetRequirements.visualNeeds'),
    ctaSuggestions: ensureArray(raw.ctaSuggestions, 'assetRequirements.ctaSuggestions'),
    targetUrls: ensureArray(raw.targetUrls, 'assetRequirements.targetUrls'),
  };
}

/**
 * Normalize AudienceIntelligence
 */
function normalizeAudienceIntelligence(raw: any): CampaignStrategy['audienceIntelligence'] {
  if (!raw) return undefined;
  
  return {
    personas: ensureArray(raw.personas, 'audienceIntelligence.personas'),
    industrySegments: ensureArray(raw.industrySegments, 'audienceIntelligence.industrySegments'),
    painPoints: ensureArray(raw.painPoints, 'audienceIntelligence.painPoints'),
    purchaseMotivations: ensureArray(raw.purchaseMotivations, 'audienceIntelligence.purchaseMotivations'),
    messagingAngle: ensureString(raw.messagingAngle, 'audienceIntelligence.messagingAngle', ''),
  };
}

/**
 * Normalize DistributionStrategy
 */
function normalizeDistributionStrategy(raw: any): CampaignStrategy['distributionStrategy'] {
  if (!raw) return undefined;
  
  return {
    channels: ensureArray(raw.channels, 'distributionStrategy.channels'),
    postingCadence: ensureString(raw.postingCadence, 'distributionStrategy.postingCadence', ''),
    bestDaysAndTimes: ensureArray(raw.bestDaysAndTimes, 'distributionStrategy.bestDaysAndTimes'),
    toneAndMessaging: ensureString(raw.toneAndMessaging, 'distributionStrategy.toneAndMessaging', ''),
    estimatedTrafficLift: ensureString(raw.estimatedTrafficLift, 'distributionStrategy.estimatedTrafficLift', ''),
  };
}

/**
 * Normalize SeoIntelligence
 */
function normalizeSeoIntelligence(raw: any): CampaignStrategy['seoIntelligence'] {
  if (!raw) return undefined;
  
  let avgRankingDifficulty: 'low' | 'medium' | 'high' = 'medium';
  if (raw.avgRankingDifficulty) {
    const difficulty = String(raw.avgRankingDifficulty).toLowerCase();
    if (difficulty === 'low' || difficulty === 'medium' || difficulty === 'high') {
      avgRankingDifficulty = difficulty as 'low' | 'medium' | 'high';
    } else {
      logNormalization({
        field: 'seoIntelligence.avgRankingDifficulty',
        issue: `Invalid value: ${raw.avgRankingDifficulty}`,
        correction: 'Defaulted to "medium"',
        originalValue: raw.avgRankingDifficulty,
        correctedValue: 'medium',
      });
    }
  }
  
  return {
    primaryKeyword: ensureString(raw.primaryKeyword, 'seoIntelligence.primaryKeyword', ''),
    secondaryKeywords: ensureArray(raw.secondaryKeywords, 'seoIntelligence.secondaryKeywords'),
    avgRankingDifficulty,
    expectedSeoImpact: ensureString(raw.expectedSeoImpact, 'seoIntelligence.expectedSeoImpact', ''),
    briefTemplatesAvailable: ensureNumber(raw.briefTemplatesAvailable, 'seoIntelligence.briefTemplatesAvailable', 0),
  };
}

/**
 * Normalize ContentBrief (basic version for ContentFormatCount.specificTopics)
 */
function normalizeContentBrief(raw: any): ContentBrief {
  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (raw.difficulty) {
    const diff = String(raw.difficulty).toLowerCase();
    if (diff === 'easy' || diff === 'medium' || diff === 'hard') {
      difficulty = diff as 'easy' | 'medium' | 'hard';
    }
  }
  
  return {
    title: ensureString(raw.title, 'contentBrief.title', 'Untitled'),
    description: ensureString(raw.description, 'contentBrief.description', ''),
    keywords: ensureArray(raw.keywords, 'contentBrief.keywords'),
    metaTitle: ensureString(raw.metaTitle, 'contentBrief.metaTitle', ''),
    metaDescription: ensureString(raw.metaDescription, 'contentBrief.metaDescription', ''),
    targetWordCount: ensureNumber(raw.targetWordCount, 'contentBrief.targetWordCount', 500),
    difficulty,
    serpOpportunity: ensureNumber(raw.serpOpportunity, 'contentBrief.serpOpportunity', 50),
  };
}

/**
 * Normalize full content briefs array for CampaignStrategy.contentBriefs
 */
function normalizeContentBriefs(rawBriefs: any): CampaignStrategy['contentBriefs'] {
  if (!rawBriefs) {
    console.warn('⚠️ [Normalizer] No contentBriefs found in strategy');
    return undefined;
  }
  
  if (!Array.isArray(rawBriefs)) {
    console.warn('⚠️ [Normalizer] contentBriefs is not an array, attempting to extract');
    // Try to extract if it's an object with array values
    if (typeof rawBriefs === 'object') {
      rawBriefs = Object.values(rawBriefs).flat();
    } else {
      return undefined;
    }
  }
  
  if (rawBriefs.length === 0) {
    console.warn('⚠️ [Normalizer] contentBriefs array is empty');
    return undefined;
  }
  
  console.log(`✅ [Normalizer] Processing ${rawBriefs.length} content briefs`);
  
  return rawBriefs.map((brief: any, index: number) => {
    let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
    if (brief.difficulty) {
      const diff = String(brief.difficulty).toLowerCase();
      if (diff === 'easy' || diff === 'medium' || diff === 'hard') {
        difficulty = diff;
      }
    }
    
    return {
      formatId: ensureString(brief.formatId, `contentBriefs[${index}].formatId`, 'blog'),
      pieceIndex: ensureNumber(brief.pieceIndex, `contentBriefs[${index}].pieceIndex`, index),
      title: ensureString(brief.title, `contentBriefs[${index}].title`, 'Untitled'),
      description: ensureString(brief.description, `contentBriefs[${index}].description`, ''),
      keywords: ensureArray(brief.keywords, `contentBriefs[${index}].keywords`),
      metaTitle: ensureString(brief.metaTitle, `contentBriefs[${index}].metaTitle`, ''),
      metaDescription: ensureString(brief.metaDescription, `contentBriefs[${index}].metaDescription`, ''),
      targetWordCount: ensureNumber(brief.targetWordCount, `contentBriefs[${index}].targetWordCount`, 500),
      difficulty,
      serpOpportunity: ensureNumber(brief.serpOpportunity, `contentBriefs[${index}].serpOpportunity`, 50),
      ctaText: ensureString(brief.ctaText, `contentBriefs[${index}].ctaText`, ''),
      publishDate: ensureString(brief.publishDate, `contentBriefs[${index}].publishDate`, ''),
      utmParams: brief.utmParams || {}
    };
  });
}

/**
 * Normalize ContentMix
 */
function normalizeContentMix(rawMix: any[]): ContentFormatCount[] {
  if (!Array.isArray(rawMix)) {
    logNormalization({
      field: 'contentMix',
      issue: 'Not an array',
      correction: 'Defaulted to empty array',
      originalValue: rawMix,
      correctedValue: [],
    });
    return [];
  }
  
  return rawMix.map((item, index) => {
    let seoPotential: 'high' | 'medium' | 'low' | undefined = undefined;
    if (item.seoPotential) {
      const potential = String(item.seoPotential).toLowerCase();
      if (potential === 'high' || potential === 'medium' || potential === 'low') {
        seoPotential = potential as 'high' | 'medium' | 'low';
      }
    }
    
    const normalized: ContentFormatCount = {
      formatId: ensureString(item.formatId, `contentMix[${index}].formatId`, 'blog'),
      count: ensureNumber(item.count, `contentMix[${index}].count`, 1),
      scheduleSuggestion: item.scheduleSuggestion ? ensureString(item.scheduleSuggestion, `contentMix[${index}].scheduleSuggestion`, '') : undefined,
      frequency: item.frequency ? ensureString(item.frequency, `contentMix[${index}].frequency`, '') : undefined,
      bestTimes: item.bestTimes ? ensureArray(item.bestTimes, `contentMix[${index}].bestTimes`) : undefined,
      estimatedEffort: item.estimatedEffort ? ensureString(item.estimatedEffort, `contentMix[${index}].estimatedEffort`, '') : undefined,
      seoPotential,
      specificTopics: item.specificTopics && Array.isArray(item.specificTopics) 
        ? item.specificTopics.map((brief: any) => normalizeContentBrief(brief))
        : undefined,
    };
    
    return normalized;
  });
}

/**
 * Main normalization function
 */
export function normalizeCampaignStrategy(rawStrategy: any): CampaignStrategy {
  // Clear previous logs
  normalizationLogs.length = 0;
  
  console.log('🔧 Starting strategy normalization...');
  
  const normalized: CampaignStrategy = {
    id: ensureString(rawStrategy.id, 'id', `strategy-${Date.now()}`),
    title: ensureString(rawStrategy.title, 'title', 'Untitled Strategy'),
    description: ensureString(rawStrategy.description, 'description', ''),
    contentMix: normalizeContentMix(rawStrategy.contentMix || []),
    estimatedReach: rawStrategy.estimatedReach ? ensureString(rawStrategy.estimatedReach, 'estimatedReach', '') : undefined,
    timeline: rawStrategy.timeline ? ensureString(rawStrategy.timeline, 'timeline', '') : undefined,
    targetAudience: rawStrategy.targetAudience ? ensureString(rawStrategy.targetAudience, 'targetAudience', '') : undefined,
    postingSchedule: rawStrategy.postingSchedule && Array.isArray(rawStrategy.postingSchedule) ? rawStrategy.postingSchedule : undefined,
    strategyScore: rawStrategy.strategyScore ? ensureNumber(rawStrategy.strategyScore, 'strategyScore', 75) : undefined,
    keyStrengths: rawStrategy.keyStrengths ? ensureArray(rawStrategy.keyStrengths, 'keyStrengths') : undefined,
    expectedEngagement: rawStrategy.expectedEngagement as 'low' | 'medium' | 'high' | undefined,
    solutionAlignment: rawStrategy.solutionAlignment ? ensureNumber(rawStrategy.solutionAlignment, 'solutionAlignment', 75) : undefined,
    competitorDifferentiation: rawStrategy.competitorDifferentiation ? ensureString(rawStrategy.competitorDifferentiation, 'competitorDifferentiation', '') : undefined,
    milestones: rawStrategy.milestones && Array.isArray(rawStrategy.milestones) ? rawStrategy.milestones : undefined,
    expectedMetrics: rawStrategy.expectedMetrics || undefined,
    contentCategories: rawStrategy.contentCategories || undefined,
    totalEffort: rawStrategy.totalEffort || undefined,
    audienceIntelligence: normalizeAudienceIntelligence(rawStrategy.audienceIntelligence),
    seoIntelligence: normalizeSeoIntelligence(rawStrategy.seoIntelligence),
    distributionStrategy: normalizeDistributionStrategy(rawStrategy.distributionStrategy),
    assetRequirements: normalizeAssetRequirements(rawStrategy.assetRequirements),
    optionalAddons: rawStrategy.optionalAddons || undefined,
    // CRITICAL: Include contentBriefs for queue-based content generation
    contentBriefs: normalizeContentBriefs(rawStrategy.contentBriefs),
  };
  
  // Log summary
  if (normalizationLogs.length > 0) {
    console.warn(`⚠️ Normalization Summary: ${normalizationLogs.length} issues corrected`);
    const issuesByField = normalizationLogs.reduce((acc, log) => {
      acc[log.field] = (acc[log.field] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.table(issuesByField);
  } else {
    console.log('✅ Strategy normalized successfully with no issues');
  }
  
  return normalized;
}
