import { useState } from 'react';
import { CampaignInput, CampaignStrategy, CampaignStrategySummary } from '@/types/campaign-types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { solutionService } from '@/services/solutionService';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { optimizeSolutionContext, optimizeCompetitorContext, optimizeSerpContext, estimateTokens } from '@/services/campaignStrategyOptimizer';
import { normalizeCampaignStrategy } from '@/utils/campaignStrategyNormalizer';
import { validateCampaignInput } from '@/utils/inputValidation';
import { retryWithBackoff } from '@/utils/retryWithBackoff';

export const useCampaignStrategies = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStrategies = async (
    input: CampaignInput, 
    userId: string,
    selectedSummary?: CampaignStrategySummary
  ): Promise<CampaignStrategy[]> => {
    setIsGenerating(true);
    setError(null);

    try {
      // Validate and sanitize input
      const sanitizedInput = validateCampaignInput(input);
      let serpContext = '';
      if (sanitizedInput.useSerpData && sanitizedInput.idea) {
        const serpData = await analyzeKeywordSerp(sanitizedInput.idea);
        if (serpData) serpContext = optimizeSerpContext(serpData);
      }

      let solutionContext = '';
      if (sanitizedInput.solutionId) {
        const { data: solution } = await supabase
          .from('solutions')
          .select(`
            id, name, short_description, description,
            features, benefits, key_differentiators,
            use_cases, target_audience, pricing_model, category
          `)
          .eq('id', sanitizedInput.solutionId)
          .single();
          
        if (solution) {
          solutionContext = `
SOLUTION DETAILS:
${JSON.stringify(solution, null, 2)}

Use this complete solution data to generate highly relevant, specific campaign strategies.`;
        }
      }

      // Build context from selected summary if provided
      let summaryContext = '';
      if (selectedSummary) {
        summaryContext = `\n\nUSER SELECTED THIS STRATEGY APPROACH:
Title: ${selectedSummary.title}
Description: ${selectedSummary.description}
Content Mix: ${selectedSummary.contentMix.map(c => `${c.count} ${c.formatId}`).join(', ')}
Expected Outcome: ${selectedSummary.expectedOutcome}
Focus: ${selectedSummary.focus}
Effort Level: ${selectedSummary.effortLevel}

IMPORTANT: Generate the FULL detailed strategy following this selected approach. Maintain the content mix ratios and focus area while expanding with all required details.`;
      }

      const systemPrompt = `You are an expert content marketing strategist specializing in SEO and data-driven campaign planning. Generate 1 comprehensive campaign strategy based on the user's input${selectedSummary ? ' and their selected strategy approach' : ''}.
${summaryContext}

IMPORTANT CONTEXT: The user provided only essential campaign details. You must INTELLIGENTLY INFER missing details:
• Pain points from goal + solution context
• Unique value propositions from solution features or market positioning
• Competitors and competitive landscape from industry knowledge
• Success metrics aligned with stated goals
• Resource requirements based on timeline and scope

Provide:
1. A compelling title and detailed description
2. A content mix with specific format types, counts, AND detailed content briefs with SEO metadata
3. Estimated reach and timeline
4. Target audience insights
5. A posting schedule for each format with frequency and best times
6. Strategy score (0-100) indicating AI confidence
7. 3-5 key strengths of this approach
8. Expected engagement level (low/medium/high)
9. How well it aligns with promoting the solution (0-100)
10. What makes this strategy stand out from competitors
11. Weekly milestones with content types
12. Expected metrics (impressions, engagement, conversions ranges)
13. Content grouped by category (Social, Video, Blog, etc.)
14. Total effort (aggregate hours, complexity level, recommended workflow order)
15. Audience intelligence (personas, industry segments, pain points, purchase motivations, messaging angle)
16. SEO intelligence (primary keyword, secondary keywords, avg ranking difficulty, expected SEO impact, brief count)
17. Distribution strategy (channels, posting cadence, best days/times, tone & messaging, estimated traffic lift)
18. Asset requirements (copy needs, visual needs, CTA suggestions, target URLs)
19. Optional add-ons (content calendar, draft copies, full SEO briefs, landing page copy, email sequences, export options)

CRITICAL DATA TYPE REQUIREMENTS - FOLLOW EXACTLY:

1. assetRequirements.copyNeeds: MUST be array of strings
   Example: ["Social media captions", "Blog post drafts"]
   NOT: {copyNeed1: "...", copyNeed2: "..."}

2. assetRequirements.visualNeeds: MUST be array of strings
   Example: ["Hero images", "Social graphics"]

3. assetRequirements.ctaSuggestions: MUST be array of strings
   Example: ["Get Started Free", "Learn More"]

4. audienceIntelligence.personas: MUST be array of strings
   Example: ["Marketing Directors", "Small Business Owners"]

5. audienceIntelligence.industrySegments: MUST be array of strings
   Example: ["SaaS", "E-commerce"]

6. audienceIntelligence.painPoints: MUST be array of strings
   Example: ["Lack of time", "Budget constraints"]

7. distributionStrategy.postingCadence: MUST be a SINGLE STRING
   Example: "3x weekly"
   NOT: {blog: "weekly", twitter: "daily"}

8. distributionStrategy.channels: MUST be array of strings
   Example: ["LinkedIn", "Twitter", "Blog"]

9. distributionStrategy.bestDaysAndTimes: MUST be array of strings
   Example: ["Tuesday 10am", "Thursday 2pm"]

10. seoIntelligence.secondaryKeywords: MUST be array of strings
    Example: ["content marketing", "SEO strategy"]

11. seoIntelligence.avgRankingDifficulty: MUST be "low", "medium", or "high"
    NOT: "easy" or "hard"

VALIDATION RULE: Before returning JSON, verify ALL array fields are actual arrays [], not objects {} or strings.

CRITICAL: For each content format in contentMix, generate specific content briefs with:
- Exact titles for each piece
- Clear description of what the content covers
- 5-8 target keywords per piece
- SEO-optimized meta title and description
- Target word count
- Difficulty level (easy/medium/hard)
- SERP opportunity score (0-100, higher = better ranking potential)

Use these content format IDs: blog, social-twitter, social-linkedin, social-facebook, social-instagram, script, email, meme, carousel, landing-page, google-ads

Return ONLY a valid JSON object (single strategy). No markdown, no explanation, just the JSON object.

Example structure:
{
    "title": "Content-First Growth Strategy",
    "description": "Focus on high-quality, SEO-optimized content to establish thought leadership and drive organic traffic",
    "contentMix": [
      {
        "formatId": "blog",
        "count": 5,
        "frequency": "2x weekly",
        "bestTimes": ["Tuesday 10 AM", "Thursday 10 AM"],
        "estimatedEffort": "2-3 hours per piece",
        "seoPotential": "high",
        "specificTopics": [
          {
            "title": "10 SQL Query Optimization Techniques for Large Datasets",
            "description": "Deep dive into indexing strategies, query execution plans, and caching techniques to improve database performance for enterprise applications",
            "keywords": ["sql optimization", "query performance", "database indexing", "sql tuning", "query execution plan", "database performance"],
            "metaTitle": "SQL Query Optimization: 10 Proven Techniques for Large Datasets | YourBrand",
            "metaDescription": "Learn 10 actionable SQL optimization techniques that reduce query time by up to 80%. Expert tips on indexing, execution plans, and performance tuning.",
            "targetWordCount": 2500,
            "difficulty": "medium",
            "serpOpportunity": 85
          },
          {
            "title": "Database Performance Monitoring: Complete Guide for 2024",
            "description": "Comprehensive guide covering monitoring tools, key metrics, alerting strategies, and best practices for maintaining optimal database performance",
            "keywords": ["database monitoring", "performance metrics", "database alerts", "monitoring tools", "database health", "performance tuning"],
            "metaTitle": "Database Performance Monitoring Guide 2024 | Tools & Best Practices",
            "metaDescription": "Master database performance monitoring with our complete 2024 guide. Discover essential metrics, top tools, and proven strategies for optimal database health.",
            "targetWordCount": 3000,
            "difficulty": "medium",
            "serpOpportunity": 78
          }
        ]
      },
      {
        "formatId": "social-twitter",
        "count": 10,
        "frequency": "Daily",
        "bestTimes": ["9 AM EST", "3 PM EST"],
        "estimatedEffort": "30 min per thread",
        "seoPotential": "medium",
        "specificTopics": [
          {
            "title": "5 Database Mistakes That Cost Companies Millions",
            "description": "Twitter thread exposing common database design and optimization mistakes that lead to performance issues and downtime",
            "keywords": ["database mistakes", "sql errors", "database design", "performance issues"],
            "metaTitle": "5 Database Mistakes That Cost Companies Millions - Twitter Thread",
            "metaDescription": "Avoid these 5 critical database mistakes that have cost companies millions in downtime and lost revenue.",
            "targetWordCount": 800,
            "difficulty": "easy",
            "serpOpportunity": 72
          }
        ]
      }
    ],
    "estimatedReach": "50,000-75,000 impressions over 4 weeks",
    "timeline": "4-week campaign with weekly milestones",
    "targetAudience": "B2B decision makers, CTOs, Product Managers",
    "postingSchedule": [
      {
        "formatId": "blog",
        "frequency": "2x weekly",
        "platform": "Website/Blog",
        "bestTimes": ["Tuesday 10 AM", "Thursday 10 AM"]
      }
    ],
    "strategyScore": 92,
    "keyStrengths": [
      "Strong SEO foundation with targeted keywords",
      "Multi-platform reach across blog and social",
      "Consistent posting schedule for engagement",
      "Data-driven content topics with high SERP opportunity",
      "Clear content briefs ready for production"
    ],
    "expectedEngagement": "high",
    "solutionAlignment": 95,
    "competitorDifferentiation": "Focuses on actionable, data-backed educational content with specific implementation guides",
    "milestones": [
      {
        "week": 1,
        "description": "Foundation content - publish 2 cornerstone blog posts",
        "contentTypes": ["blog", "social-twitter"]
      }
    ],
    "expectedMetrics": {
      "impressions": { "min": 50000, "max": 75000 },
      "engagement": { "min": 2500, "max": 5000 },
      "conversions": { "min": 50, "max": 150 }
    },
    "contentCategories": {
      "Social": 10,
      "Blog": 5
    }
  }
]

IMPORTANT: Ensure every content format has at least 2-3 specific topic briefs with complete SEO metadata. Make topics actionable and specific, not generic.`;
      const userMessage = `Generate 1 comprehensive campaign strategy for: "${input.idea}"${solutionContext}${serpContext}`;

      console.log(`📊 [Campaign Strategies] Generating strategy...`);
      
      // Use edge function with retry logic (max 3 attempts)
      const { data, error } = await retryWithBackoff(
        () => supabase.functions.invoke('generate-campaign-strategy', {
          body: {
            input: sanitizedInput,
            userId,
            selectedSummary,
            serpContext,
            solutionContext: solutionContext ? { solution: solutionContext } : undefined,
            competitorContext: undefined
          }
        }),
        { maxRetries: 3, initialDelay: 2000 }
      );
      
      console.log(`📊 [Campaign Strategies] Response received:`, {
        hasData: !!data,
        hasError: !!error,
        dataKeys: data ? Object.keys(data) : [],
        errorMessage: error?.message
      });
      
      if (error || !data?.strategy) {
        console.error(`📊 [Campaign Strategies] ❌ Error:`, error);
        throw new Error(error?.message || 'Failed to generate strategy');
      }

      const aiResponse = data;
      console.log(`📊 [Campaign Strategies] ✅ Strategy generated successfully`);

      console.log('📊 [Campaign Strategies] Processing AI response...');
      const rawStrategy = aiResponse.strategy;
      
      console.log('📊 [Campaign Strategies] Normalizing strategy...');
      const strategy = normalizeCampaignStrategy(rawStrategy);
      
      console.log('📊 [Campaign Strategies] ✅ Strategy normalized successfully');
      console.log('📊 [Campaign Strategies] Normalized strategy:', {
        title: strategy.title,
        contentMixCount: strategy.contentMix?.length || 0,
        hasId: !!strategy.id,
        hasDescription: !!strategy.description
      });

      // Auto-generate ID if missing
      if (!strategy.id) {
        console.warn('📊 [Campaign Strategies] ⚠️ No ID found, generating one...');
        strategy.id = `strategy-${Date.now()}`;
      }

      // Validate required fields
      console.log('📊 [Campaign Strategies] Validating required fields...');
      if (!strategy.title || !strategy.description || !strategy.contentMix || strategy.contentMix.length === 0) {
        console.error('📊 [Campaign Strategies] ❌ Validation failed:', {
          hasTitle: !!strategy.title,
          hasDescription: !!strategy.description,
          hasContentMix: !!strategy.contentMix,
          contentMixLength: strategy.contentMix?.length || 0
        });
        throw new Error('Strategy missing required fields');
      }
      
      console.log('📊 [Campaign Strategies] ✅ Validation passed');
      toast.success('Generated comprehensive campaign strategy');
      console.log('📊 [Campaign Strategies] 🎉 Returning strategy:', strategy.title);
      return [strategy]; // Return as array for compatibility
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateStrategies, isGenerating, error };
};
