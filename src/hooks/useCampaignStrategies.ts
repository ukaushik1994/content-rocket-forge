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

      const systemPrompt = `Generate ONLY a raw JSON array of 3 campaign strategies. No markdown, no explanations.`;
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
      const valid = strategies.filter(s => s.id && s.title);
      
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
