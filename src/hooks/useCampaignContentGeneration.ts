import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContentBrief, GeneratedContent } from '@/types/campaign-types';

interface GenerationProgress {
  total: number;
  completed: number;
  current: number;
  failed: number;
  status: 'idle' | 'generating' | 'completed' | 'error';
}

export const useCampaignContentGeneration = () => {
  const [generatedItems, setGeneratedItems] = useState<Map<string, GeneratedContent>>(new Map());
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    total: 0,
    completed: 0,
    current: 0,
    failed: 0,
    status: 'idle'
  });
  const { toast } = useToast();

  const generateContent = useCallback(async (
    brief: ContentBrief,
    campaignId: string,
    solutionId: string | null,
    formatId: string,
    pieceIndex: number,
    campaignContext: any,
    solutionData: any | null,
    userId: string
  ): Promise<GeneratedContent> => {
    const key = `${formatId}-${pieceIndex}`;
    
    // Set status to generating
    const tempContent: GeneratedContent = {
      id: key,
      title: brief.title,
      content: '',
      formatId,
      status: 'generating',
      brief,
      wordCount: 0,
      createdAt: new Date()
    };
    
    setGeneratedItems(prev => new Map(prev).set(key, tempContent));

    try {
      console.log('[Content Generation] Starting generation:', key);

      const { data, error } = await supabase.functions.invoke('campaign-content-generator', {
        body: {
          brief,
          campaignId,
          solutionId,
          formatId,
          campaignContext,
          solutionData,
          userId
        }
      });

      if (error) throw error;

      const generatedContent: GeneratedContent = {
        id: data.content.id,
        title: data.content.title,
        content: data.content.content,
        formatId,
        status: 'ready',
        brief,
        wordCount: data.wordCount,
        seoScore: brief.serpOpportunity,
        createdAt: new Date(data.content.created_at)
      };

      setGeneratedItems(prev => new Map(prev).set(key, generatedContent));

      toast({
        title: "✨ Content Generated!",
        description: `${brief.title} is ready (${data.wordCount} words)`,
      });

      return generatedContent;

    } catch (error: any) {
      console.error('[Content Generation] Error:', error);

      const errorContent: GeneratedContent = {
        ...tempContent,
        status: 'error',
        error: error.message || 'Failed to generate content'
      };

      setGeneratedItems(prev => new Map(prev).set(key, errorContent));

      // Handle specific errors
      if (error.message?.includes('AI provider')) {
        toast({
          title: "Configuration Error",
          description: "Please configure an AI provider in Settings.",
          variant: "destructive"
        });
      } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Please wait a moment and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Generation Failed",
          description: error.message || 'Failed to generate content',
          variant: "destructive"
        });
      }

      throw error;
    }
  }, [toast]);

  const generateAllContent = useCallback(async (
    items: Array<{
      brief: ContentBrief;
      formatId: string;
      index: number;
    }>,
    campaignId: string,
    solutionId: string | null,
    campaignContext: any,
    solutionData: any | null,
    userId: string
  ) => {
    setGenerationProgress({
      total: items.length,
      completed: 0,
      current: 0,
      failed: 0,
      status: 'generating'
    });

    let completed = 0;
    let failed = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      setGenerationProgress(prev => ({
        ...prev,
        current: i + 1
      }));

      try {
        await generateContent(
          item.brief,
          campaignId,
          solutionId,
          item.formatId,
          item.index,
          campaignContext,
          solutionData,
          userId
        );
        completed++;
      } catch (error) {
        failed++;
      }

      setGenerationProgress(prev => ({
        ...prev,
        completed,
        failed
      }));
    }

    setGenerationProgress(prev => ({
      ...prev,
      status: 'completed',
      current: 0
    }));

    toast({
      title: "Generation Complete!",
      description: `${completed} pieces generated successfully${failed > 0 ? `, ${failed} failed` : ''}`,
    });
  }, [generateContent, toast]);

  const getContentByKey = useCallback((formatId: string, index: number): GeneratedContent | undefined => {
    const key = `${formatId}-${index}`;
    return generatedItems.get(key);
  }, [generatedItems]);

  const cancelGeneration = useCallback(() => {
    setGenerationProgress({
      total: 0,
      completed: 0,
      current: 0,
      failed: 0,
      status: 'idle'
    });
  }, []);

  return {
    generateContent,
    generateAllContent,
    generatedItems,
    generationProgress,
    getContentByKey,
    cancelGeneration
  };
};
