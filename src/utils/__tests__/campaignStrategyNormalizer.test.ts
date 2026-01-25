import { describe, it, expect, beforeEach } from 'vitest';
import { normalizeCampaignStrategy } from '../campaignStrategyNormalizer';

describe('campaignStrategyNormalizer', () => {
  describe('normalizeCampaignStrategy', () => {
    it('should pass through a valid strategy unchanged', () => {
      const validStrategy = {
        id: 'test-123',
        title: 'Test Campaign',
        description: 'A test campaign',
        targetAudience: 'Marketers',
        timeline: '4 weeks',
        estimatedReach: '10K users',
        contentMix: [
          { formatId: 'blog-post', formatName: 'Blog Post', count: 5 }
        ],
        audienceIntelligence: {
          personas: ['Marketing Manager', 'CMO'],
          industrySegments: ['SaaS', 'Tech'],
          painPoints: ['Time constraints', 'Budget limits'],
          purchaseMotivations: ['ROI improvement'],
          messagingAngle: 'Efficiency focused'
        },
        distributionStrategy: {
          channels: ['LinkedIn', 'Twitter'],
          postingCadence: '3x weekly',
          bestDaysAndTimes: ['Tuesday 10am', 'Thursday 2pm'],
          toneAndMessaging: 'Professional',
          estimatedTrafficLift: '25%'
        }
      };

      const normalized = normalizeCampaignStrategy(validStrategy);
      
      expect(normalized.title).toBe('Test Campaign');
      expect(normalized.contentMix).toHaveLength(1);
      expect(normalized.audienceIntelligence?.personas).toEqual(['Marketing Manager', 'CMO']);
      expect(normalized.distributionStrategy?.postingCadence).toBe('3x weekly');
    });

    it('should convert string to array for copyNeeds', () => {
      const malformedStrategy = {
        title: 'Test',
        description: 'Test',
        contentMix: [],
        assetRequirements: {
          copyNeeds: 'Social media captions',
          visualNeeds: ['Images'],
          ctaSuggestions: ['Click here'],
          targetUrls: ['https://example.com']
        }
      };

      const normalized = normalizeCampaignStrategy(malformedStrategy);
      
      expect(Array.isArray(normalized.assetRequirements?.copyNeeds)).toBe(true);
      expect(normalized.assetRequirements?.copyNeeds).toEqual(['Social media captions']);
    });

    it('should convert object to array for copyNeeds', () => {
      const malformedStrategy = {
        title: 'Test',
        description: 'Test',
        contentMix: [],
        assetRequirements: {
          copyNeeds: { need1: 'Captions', need2: 'Headlines' },
          visualNeeds: [],
          ctaSuggestions: [],
          targetUrls: []
        }
      };

      const normalized = normalizeCampaignStrategy(malformedStrategy);
      
      expect(Array.isArray(normalized.assetRequirements?.copyNeeds)).toBe(true);
      expect(normalized.assetRequirements?.copyNeeds).toContain('Captions');
      expect(normalized.assetRequirements?.copyNeeds).toContain('Headlines');
    });

    it('should convert object to string for postingCadence', () => {
      const malformedStrategy = {
        title: 'Test',
        description: 'Test',
        contentMix: [],
        distributionStrategy: {
          channels: ['LinkedIn'],
          postingCadence: { blog: 'weekly', social: 'daily' },
          bestDaysAndTimes: ['Monday 9am'],
          toneAndMessaging: 'Professional',
          estimatedTrafficLift: '20%'
        }
      };

      const normalized = normalizeCampaignStrategy(malformedStrategy);
      
      expect(typeof normalized.distributionStrategy?.postingCadence).toBe('string');
      expect(normalized.distributionStrategy?.postingCadence).toContain('weekly');
    });

    it('should handle missing optional fields gracefully', () => {
      const minimalStrategy = {
        title: 'Minimal Campaign',
        description: 'Basic campaign',
        contentMix: []
      };

      const normalized = normalizeCampaignStrategy(minimalStrategy);
      
      expect(normalized.title).toBe('Minimal Campaign');
      expect(normalized.description).toBe('Basic campaign');
      expect(normalized.id).toBeDefined();
      // targetAudience and timeline are optional - only set if provided
      expect(normalized.targetAudience).toBeUndefined();
      expect(normalized.timeline).toBeUndefined();
    });

    it('should generate ID if missing', () => {
      const strategyWithoutId = {
        title: 'Test',
        description: 'Test',
        contentMix: []
      };

      const normalized = normalizeCampaignStrategy(strategyWithoutId);
      
      expect(normalized.id).toBeDefined();
      expect(normalized.id).toMatch(/^strategy-/);
    });

    it('should normalize avgRankingDifficulty to valid values', () => {
      const strategyWithInvalidDifficulty = {
        title: 'Test',
        description: 'Test',
        contentMix: [],
        seoIntelligence: {
          primaryKeyword: 'test keyword',
          secondaryKeywords: ['keyword1', 'keyword2'],
          avgRankingDifficulty: 'easy' as any, // Invalid value
          expectedSeoImpact: 'High',
          briefTemplatesAvailable: 3
        }
      };

      const normalized = normalizeCampaignStrategy(strategyWithInvalidDifficulty);
      
      expect(['low', 'medium', 'high']).toContain(normalized.seoIntelligence?.avgRankingDifficulty);
    });

    it('should handle array fields correctly', () => {
      const strategy = {
        title: 'Test',
        description: 'Test',
        contentMix: [],
        audienceIntelligence: {
          personas: 'Single Persona', // Should convert to array
          industrySegments: ['Tech', 'SaaS'],
          painPoints: { point1: 'Time', point2: 'Budget' }, // Should convert to array
          purchaseMotivations: ['ROI'],
          messagingAngle: 'Efficiency'
        }
      };

      const normalized = normalizeCampaignStrategy(strategy);
      
      expect(Array.isArray(normalized.audienceIntelligence?.personas)).toBe(true);
      expect(Array.isArray(normalized.audienceIntelligence?.painPoints)).toBe(true);
      expect(normalized.audienceIntelligence?.industrySegments).toEqual(['Tech', 'SaaS']);
    });

    it('should preserve contentBriefs array when provided', () => {
      const rawStrategy = {
        id: 'test-1',
        title: 'Test Strategy',
        description: 'Test description',
        contentMix: [{ formatId: 'blog', count: 2 }],
        contentBriefs: [
          {
            formatId: 'blog',
            pieceIndex: 0,
            title: 'Test Blog Post',
            description: 'A test description',
            keywords: ['test', 'blog'],
            metaTitle: 'Test Meta',
            metaDescription: 'Test meta desc',
            targetWordCount: 1500,
            difficulty: 'medium',
            serpOpportunity: 75,
            ctaText: 'Learn More',
            publishDate: '',
            utmParams: {}
          }
        ]
      };
      
      const result = normalizeCampaignStrategy(rawStrategy);
      expect(result.contentBriefs).toBeDefined();
      expect(result.contentBriefs?.length).toBe(1);
      expect(result.contentBriefs?.[0].title).toBe('Test Blog Post');
      expect(result.contentBriefs?.[0].targetWordCount).toBe(1500);
    });

    it('should normalize contentBriefs with missing fields', () => {
      const rawStrategy = {
        title: 'Test',
        description: 'Test',
        contentMix: [],
        contentBriefs: [
          {
            formatId: 'social-twitter',
            title: 'Twitter Thread'
            // Missing other fields
          }
        ]
      };
      
      const result = normalizeCampaignStrategy(rawStrategy);
      expect(result.contentBriefs).toBeDefined();
      expect(result.contentBriefs?.[0].formatId).toBe('social-twitter');
      expect(result.contentBriefs?.[0].title).toBe('Twitter Thread');
      expect(result.contentBriefs?.[0].targetWordCount).toBe(500); // Default
      expect(result.contentBriefs?.[0].difficulty).toBe('medium'); // Default
    });

    it('should return undefined contentBriefs for empty array', () => {
      const rawStrategy = {
        title: 'Test',
        description: 'Test',
        contentMix: [],
        contentBriefs: []
      };
      
      const result = normalizeCampaignStrategy(rawStrategy);
      expect(result.contentBriefs).toBeUndefined();
    });
  });
});
