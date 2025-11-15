import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CampaignInput, CampaignStrategy } from '@/types/campaign-types';
import { toast } from 'sonner';

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
      const { data, error: functionError } = await supabase.functions.invoke(
        'generate-campaign-strategies',
        {
          body: {
            userId,
            campaignIdea: input.idea,
            targetAudience: input.targetAudience,
            goal: input.goal,
            timeline: input.timeline,
            companyInfo,
          },
        }
      );

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Failed to generate strategies');
      }

      if (!data?.success || !data?.strategies) {
        throw new Error('Invalid response from strategy generation');
      }

      return data.strategies;
    } catch (err: any) {
      console.error('Error generating strategies:', err);
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
