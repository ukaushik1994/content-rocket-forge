import { useState } from 'react';
import { CampaignInput, CampaignStrategy } from '@/types/campaign-types';
import { toast } from 'sonner';
import AIServiceController from '@/services/aiService/AIServiceController';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { solutionService } from '@/services/solutionService';
import { supabase } from '@/integrations/supabase/client';

export const useCampaignStrategies = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStrategies = async (
    input: CampaignInput,
    userId: string,
    companyInfo?: any
  ): Promise<CampaignStrategy[]> => {
    setIsGenerating(true);
    setError(null);

    try {
      // Step 1: Optionally fetch SERP data
      let serpContext = '';
      if (input.useSerpData && input.idea) {
        try {
          console.log('🔍 Fetching SERP data for campaign idea...');
          const serpData = await analyzeKeywordSerp(input.idea);
          
          if (serpData) {
            const keywords = serpData.keywords?.slice(0, 8).join(', ') || '';
            const paaQuestions = serpData.peopleAlsoAsk?.slice(0, 5).map(q => q.question).join('; ') || '';
            const relatedSearches = serpData.relatedSearches?.slice(0, 5).map(r => r.query).join(', ') || '';
            
            serpContext = `\n\n=== SERP Intelligence ===
Related Keywords: ${keywords}
People Also Ask: ${paaQuestions}
Related Searches: ${relatedSearches}
Trending Topics: Use these insights to create data-driven, SEO-optimized strategies.`;
            
            console.log('✅ SERP data fetched successfully');
          }
        } catch (serpError) {
          console.warn('⚠️ SERP fetch failed, continuing without SERP data:', serpError);
        }
      }

      // Step 2: Fetch solution and competitor data if solution is selected
      let solutionContext = '';
      if (input.solutionId) {
        try {
          console.log('📦 Fetching solution and competitor data...');
          const [solution, competitorsData] = await Promise.all([
            solutionService.getSolutionById(input.solutionId),
            supabase.from('company_competitors').select('*').eq('user_id', userId).order('priority_order')
          ]);

          if (solution) {
            const competitors = competitorsData.data || [];
            solutionContext = `\n\n=== SOLUTION CONTEXT ===
Solution Name: ${solution.name}
Description: ${solution.description || 'N/A'}
Short Description: ${solution.shortDescription || 'N/A'}
Key Features: ${solution.features?.join(', ') || 'N/A'}
Pain Points Addressed: ${solution.painPoints?.join(', ') || 'N/A'}
Target Audience: ${solution.targetAudience?.join(', ') || 'N/A'}
Unique Value Propositions: ${solution.uniqueValuePropositions?.join(', ') || 'N/A'}
Key Differentiators: ${solution.keyDifferentiators?.join(', ') || 'N/A'}
Positioning: ${solution.positioningStatement || 'N/A'}
Category: ${solution.category || 'N/A'}

${competitors.length > 0 ? `=== COMPETITOR LANDSCAPE ===
${competitors.slice(0, 5).map(c => `- ${c.name}: ${c.description || 'N/A'} | Market Position: ${c.market_position || 'N/A'}`).join('\n')}

OBJECTIVE: Create campaign strategies that:
1. Highlight the solution's unique features and differentiators
2. Address pain points the solution solves
3. Position against competitor weaknesses
4. Target the solution's ideal audience
5. Leverage solution benefits and use cases` : ''}`;
            
            console.log('✅ Solution and competitor data fetched');
          }
        } catch (solutionError) {
          console.warn('⚠️ Failed to fetch solution data:', solutionError);
        }
      }

      // Step 3: Build the enhanced prompt
      const systemPrompt = `You are a strategic campaign planner specializing in content marketing and audience engagement.
Your role is to generate exactly 4 diverse, actionable campaign strategies based on the provided information.

${serpContext ? 'IMPORTANT: Leverage the SERP intelligence data to create SEO-optimized, data-driven strategies that align with current search trends and user intent.' : ''}

${solutionContext ? 'CRITICAL: This campaign is promoting a specific solution. All strategies MUST highlight the solution\'s unique value, features, and differentiators. Ensure content mix and messaging directly support solution awareness and conversion.' : ''}

CRITICAL: Return ONLY valid JSON - no markdown, no code blocks, no trailing commas.
Return your response as a valid JSON array with exactly 4 strategy objects. Each object must have:
- id: unique identifier (string)
- title: compelling strategy name (string)
- description: detailed explanation of the strategy (string)
- contentMix: array of {formatId: string, count: number, scheduleSuggestion?: string}
- estimatedReach: estimated audience reach (string, optional)
- timeline: execution timeline (string, optional)
- targetAudience: specific audience segment (string, optional)
- postingSchedule: array of {formatId: string, frequency: string, platform?: string, bestTimes?: string[]}
- strategyScore: AI confidence score 0-100 (number)
- keyStrengths: 3-5 key advantages of this strategy (string array)
- expectedEngagement: 'low', 'medium', or 'high' (string)
- solutionAlignment: 0-100 how well it promotes the solution (number, optional)
- competitorDifferentiation: how this strategy stands out from competitors (string, optional)
- milestones: array of {week: number, description: string, contentTypes: string[]} (optional)
- expectedMetrics: {impressions: {min: number, max: number}, engagement: {min: number, max: number}, conversions: {min: number, max: number}} (optional)
- contentCategories: object grouping content by category like {"Social": 24, "Blog": 12, "Video": 6} (optional)

Format IDs can include: blog-post, social-media, video, infographic, email-newsletter, podcast, webinar, case-study, whitepaper, etc.

IMPORTANT: Ensure all JSON arrays have NO trailing commas. Example:
CORRECT: ["item1", "item2"]
WRONG: ["item1", "item2",]`;

      const userPrompt = `Campaign Idea: ${input.idea}
${input.targetAudience ? `Target Audience: ${input.targetAudience}` : ''}
${input.goal ? `Goal: ${input.goal}` : ''}
${input.timeline ? `Timeline: ${input.timeline}` : ''}
${companyInfo ? `\nCompany Context: ${JSON.stringify(companyInfo)}` : ''}${serpContext}${solutionContext}

Generate 4 distinct campaign strategies as a JSON array with all the required and optional fields including strategyScore, keyStrengths, expectedEngagement, and metrics.`;

      console.log('🤖 Generating campaign strategies with AIServiceController...');
      
      // Step 4: Call AI service
      const aiResponse = await AIServiceController.generate({
        input: `${systemPrompt}\n\n${userPrompt}`,
        use_case: 'strategy',
        temperature: 0.7,
        max_tokens: 6000,
      });

      console.log('✅ AI response received:', aiResponse.provider_used, aiResponse.model_used);

      // Step 4: Parse JSON response
      let strategies: CampaignStrategy[];
      try {
        // Try to extract JSON from markdown code blocks if present
        let jsonContent = aiResponse.content.trim();
        const jsonMatch = jsonContent.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }
        
        // Clean up trailing commas before parsing
        jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');
        
        strategies = JSON.parse(jsonContent);
        
        if (!Array.isArray(strategies) || strategies.length === 0) {
          throw new Error('Invalid strategies format: expected non-empty array');
        }
        
        console.log(`✅ Parsed ${strategies.length} campaign strategies`);
      } catch (parseError) {
        console.error('❌ Failed to parse AI response as JSON:', parseError);
        console.error('Raw response:', aiResponse.content);
        throw new Error('Failed to parse campaign strategies. Please try again.');
      }

      return strategies;
    } catch (err: any) {
      console.error('❌ Error generating strategies:', err);
      const errorMessage = err.message || 'Failed to generate campaign strategies';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateStrategies,
    isGenerating,
    error,
  };
};
