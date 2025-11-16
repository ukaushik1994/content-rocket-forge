import { useState } from 'react';
import { CampaignInput, CampaignStrategy, CampaignStrategySummary } from '@/types/campaign-types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { solutionService } from '@/services/solutionService';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { optimizeSolutionContext, optimizeCompetitorContext, optimizeSerpContext, estimateTokens } from '@/services/campaignStrategyOptimizer';
import { normalizeCampaignStrategy } from '@/utils/campaignStrategyNormalizer';

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
      let serpContext = '';
      if (input.useSerpData && input.idea) {
        const serpData = await analyzeKeywordSerp(input.idea);
        if (serpData) serpContext = optimizeSerpContext(serpData);
      }

      let solutionContext = '';
      if (input.solutionId) {
        const [solution, competitors] = await Promise.all([
          solutionService.getSolutionById(input.solutionId),
          supabase.from('company_competitors').select('*').eq('user_id', userId)
        ]);
        if (solution) {
          const opt = optimizeSolutionContext(solution);
          const comps = optimizeCompetitorContext(competitors.data || []);
          solutionContext = `\n\nSOLUTION: ${opt.name}\n${opt.shortDescription || ''}\nFeatures: ${opt.features?.join(', ')}\nDifferentiators: ${opt.keyDifferentiators?.join(', ')}${comps.length > 0 ? `\nCompetitors: ${comps.map(c => c.name).join(', ')}` : ''}`;
          console.log('📊 Context tokens:', estimateTokens(solutionContext));
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

Use these content format IDs: blog, social-twitter, social-linkedin, social-facebook, social-instagram, script, email, meme, carousel, landing-page

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

      let aiResponse = null;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Attempt ${attempt}/${maxRetries} to generate strategies`);
          
          const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
            body: {
              messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
              context: { use_case: 'strategy' }
            }
          });
          
          if (!error && data) {
            aiResponse = data;
            console.log('✅ Response:', (data.response || data.content).length, 'chars');
            break;
          }
          
          // Handle rate limiting errors
          if (error && (error.message?.includes('429') || error.message?.includes('rate limit') || error.message?.includes('Rate limit'))) {
            console.warn(`⏰ Rate limit hit on attempt ${attempt}, waiting before retry...`);
            if (attempt < maxRetries) {
              await new Promise(r => setTimeout(r, 5000 * attempt));
              continue;
            }
          }
          
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 2000 * attempt));
          }
        } catch (retryError) {
          console.error(`❌ Attempt ${attempt} failed:`, retryError);
          if (attempt === maxRetries) {
            throw new Error('Failed to generate strategies after multiple attempts. Please try again in a moment.');
          }
          await new Promise(r => setTimeout(r, 2000 * attempt));
        }
      }

      if (!aiResponse) {
        throw new Error('AI service temporarily unavailable. Please try again in a moment.');
      }

      let content = (aiResponse.response || aiResponse.content || '').replace(/```json\s*/g, '').replace(/```/g, '').trim();
      
      // Parse single strategy object (not array)
      let strategy: CampaignStrategy;
      try {
        // Try to extract JSON object from response
        const jsonMatch = content.match(/\{[\s\S]*\}/)?.[0];
        const rawStrategy = JSON.parse(jsonMatch || content);
        
        // ✨ CRITICAL: Normalize the strategy before using it
        strategy = normalizeCampaignStrategy(rawStrategy);
        
        console.log('✅ Strategy normalized successfully');
      } catch (parseError) {
        console.error('Failed to parse strategy:', parseError);
        throw new Error('Invalid strategy format generated');
      }

      // Auto-generate ID if missing (normalization should handle this, but double-check)
      if (!strategy.id) {
        strategy.id = `strategy-${Date.now()}`;
      }

      // Validate required fields
      if (!strategy.title || !strategy.description || !strategy.contentMix || strategy.contentMix.length === 0) {
        throw new Error('Strategy missing required fields');
      }
      
      toast.success('Generated comprehensive campaign strategy');
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
