import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContentBrief, GeneratedContent } from '@/types/campaign-types';
import { retryWithBackoff } from '@/utils/retryWithBackoff';

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
      const { data, error } = await retryWithBackoff(
        () => supabase.functions.invoke('campaign-content-generator', {
          body: {
            brief,
            campaignId,
            solutionId,
            formatId,
            campaignContext,
            solutionData,
            userId
          }
        }),
        { maxRetries: 3, initialDelay: 2000 }
      );

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

      toast({
        title: "Generation Failed",
        description: error.message || 'Failed to generate content',
        variant: "destructive"
      });

      throw error;
    }
  }, [toast]);

  const generateAllContent = useCallback(async (
    items: Array<{ brief: ContentBrief; formatId: string; index: number; }>,
    campaignId: string,
    solutionId: string | null,
    campaignContext: any,
    solutionData: any | null,
    userId: string
  ) => {
    console.log(`🚀 [Queue System] Adding ${items.length} items to generation queue`);
    
    setGenerationProgress({
      status: 'generating',
      total: items.length,
      current: 0,
      completed: 0,
      failed: 0
    });

    try {
      await supabase
        .from('campaigns')
        .update({ status: 'planned', updated_at: new Date().toISOString() })
        .eq('id', campaignId);

      const queueItems = items.map((item, index) => {
        // Validate piece_index is a valid number
        if (typeof item.index !== 'number' || isNaN(item.index)) {
          console.error(`Invalid piece_index for item:`, item);
          throw new Error(`Invalid content index: ${item.index}`);
        }
        
        return {
          campaign_id: campaignId,
          user_id: userId,
          format_id: item.formatId,
          piece_index: item.index, // Now guaranteed to be a valid number
          brief: item.brief as any,
          campaign_context: campaignContext as any,
          solution_data: solutionData as any,
          status: 'pending' as const,
          priority: items.length - index,
          retry_count: 0,
          max_retries: 3,
        };
      });

      const { error: insertError } = await supabase
        .from('content_generation_queue')
        .insert(queueItems);

      if (insertError) throw insertError;

      const { error: processError } = await supabase.functions.invoke('process-content-queue');
      
      toast({
        title: "Generation Started!",
        description: `${items.length} content pieces are being generated. You can close this and come back anytime.`,
      });

      setGenerationProgress({
        status: 'completed',
        total: items.length,
        current: 0,
        completed: 0,
        failed: 0
      });

    } catch (error: any) {
      console.error('Failed to add items to queue:', error);
      
      const errorMessage = error.message?.includes('piece_index') 
        ? 'Invalid content format. Please regenerate content briefs.'
        : error.message || 'Failed to start content generation';
      
      toast({
        title: "Queue Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      setGenerationProgress({
        status: 'idle',
        total: 0,
        current: 0,
        completed: 0,
        failed: 0
      });
    }
  }, [toast]);

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
