import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface OpenRouterResponse {
  generatedText: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  costEstimate?: number;
  duration?: number;
}

export const useOpenRouter = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContent = async (
    prompt: string, 
    options?: {
      model?: string;
      temperature?: number;
    }
  ): Promise<OpenRouterResponse | null> => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return null;
    }

    try {
      setIsGenerating(true);
      console.log('🚀 Generating content with OpenRouter...');

      const { data, error } = await supabase.functions.invoke('openrouter-content-generator', {
        body: {
          prompt,
          user_id: user.id,
          model: options?.model,
          temperature: options?.temperature || 0.7
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log('✅ Content generated successfully');
      return data as OpenRouterResponse;

    } catch (error: any) {
      console.error('❌ OpenRouter generation failed:', error);
      
      // Handle specific error cases
      if (error.message.includes('not configured')) {
        toast.error('OpenRouter not configured. Please add your API key in Settings.');
      } else if (error.message.includes('Rate limit')) {
        toast.error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.message.includes('credits')) {
        toast.error('Insufficient credits. Please check your OpenRouter account.');
      } else {
        toast.error(`Content generation failed: ${error.message}`);
      }
      
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const verifyApiKey = async (apiKey: string) => {
    try {
      console.log('🔍 Verifying OpenRouter API key...');

      const { data, error } = await supabase.functions.invoke('verify-openrouter-key', {
        body: { api_key: apiKey }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('❌ Key verification failed:', error);
      throw error;
    }
  };

  const getUsageLogs = async (limit = 10) => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('llm_usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'openrouter')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching usage logs:', error);
      return [];
    }
  };

  const getCurrentModel = async () => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('user_llm_keys')
        .select('model')
        .eq('user_id', user.id)
        .eq('provider', 'openrouter')
        .eq('is_active', true)
        .single();

      if (error) return null;
      return data?.model || 'openai/gpt-4';
    } catch (error) {
      return null;
    }
  };

  return {
    generateContent,
    verifyApiKey,
    getUsageLogs,
    getCurrentModel,
    isGenerating
  };
};