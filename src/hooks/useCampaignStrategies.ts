import { useState } from 'react';
import { CampaignInput, CampaignStrategy } from '@/types/campaign-types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { solutionService } from '@/services/solutionService';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { optimizeSolutionContext, optimizeCompetitorContext, optimizeSerpContext, estimateTokens } from '@/services/campaignStrategyOptimizer';

export const useCampaignStrategies = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStrategies = async (input: CampaignInput, userId: string): Promise<CampaignStrategy[]> => {
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

      const systemPrompt = `You are an expert content marketing strategist specializing in SEO and data-driven campaign planning. Generate 3 diverse campaign strategies based on the user's input.

For each strategy, provide:
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

CRITICAL: For each content format in contentMix, generate specific content briefs with:
- Exact titles for each piece
- Clear description of what the content covers
- 5-8 target keywords per piece
- SEO-optimized meta title and description
- Target word count
- Difficulty level (easy/medium/hard)
- SERP opportunity score (0-100, higher = better ranking potential)

Use these content format IDs: blog, social-twitter, social-linkedin, social-facebook, social-instagram, script, email, meme, carousel, landing-page

Return ONLY a valid JSON array of 3 strategies. No markdown, no explanation, just the JSON array.

Example structure:
[
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
      const userMessage = `Generate 3 strategies for: "${input.idea}"${solutionContext}${serpContext}`;

      let aiResponse = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
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
        if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
      }

      if (!aiResponse) throw new Error('Failed to generate strategies');

      let content = (aiResponse.response || aiResponse.content || '').replace(/```json\s*/g, '').replace(/```/g, '').trim();
      let strategies: CampaignStrategy[] = JSON.parse(content.match(/\[[\s\S]*\]/)?.[0] || content);

      // Auto-generate IDs if missing
      strategies = strategies.map((s, index) => ({
        ...s,
        id: s.id || `strategy-${Date.now()}-${index}`
      }));

      const valid = strategies.filter(s => s.title && s.description && s.contentMix);
      
      if (valid.length === 0) throw new Error('No valid strategies');
      toast.success(`Generated ${valid.length} strategies`);
      return valid;
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
