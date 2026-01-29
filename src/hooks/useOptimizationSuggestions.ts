import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OptimizationSuggestion {
  id: string;
  content_id: string;
  suggestion_type: string;
  original_content: string | null;
  suggested_content: string | null;
  reason: string | null;
  status: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

export function useOptimizationSuggestions(contentId: string | null) {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    if (!contentId) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_optimization_history')
        .select('*')
        .eq('content_id', contentId)
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSuggestions((data || []).map(item => ({
        ...item,
        metadata: item.metadata as Record<string, any> | null
      })));
    } catch (error) {
      console.error('Failed to fetch optimization suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const applySuggestions = useCallback(async (
    selectedSuggestions: OptimizationSuggestion[], 
    currentContent: string
  ): Promise<string> => {
    let newContent = currentContent;

    for (const suggestion of selectedSuggestions) {
      // Apply the suggestion to the content
      if (suggestion.original_content && suggestion.suggested_content) {
        // Replace original with suggested content
        newContent = newContent.replace(
          suggestion.original_content, 
          suggestion.suggested_content
        );
      }

      // Mark suggestion as applied
      await supabase
        .from('content_optimization_history')
        .update({ 
          status: 'applied',
          applied_at: new Date().toISOString()
        })
        .eq('id', suggestion.id);
    }

    // Update pending count on content_items
    const { data: remainingCount } = await supabase
      .from('content_optimization_history')
      .select('id', { count: 'exact' })
      .eq('content_id', selectedSuggestions[0]?.content_id)
      .eq('status', 'pending_review');

    if (selectedSuggestions[0]?.content_id) {
      await supabase
        .from('content_items')
        .update({ pending_optimizations_count: remainingCount?.length || 0 })
        .eq('id', selectedSuggestions[0].content_id);
    }

    toast.success(`Applied ${selectedSuggestions.length} suggestion(s)`);
    await fetchSuggestions();
    
    return newContent;
  }, [fetchSuggestions]);

  const dismissSuggestions = useCallback(async (suggestionIds: string[]) => {
    try {
      await supabase
        .from('content_optimization_history')
        .update({ status: 'dismissed' })
        .in('id', suggestionIds);

      // Update pending count
      if (suggestions.length > 0) {
        const contentId = suggestions[0].content_id;
        const remainingCount = suggestions.length - suggestionIds.length;
        
        await supabase
          .from('content_items')
          .update({ pending_optimizations_count: Math.max(0, remainingCount) })
          .eq('id', contentId);
      }

      toast.success('Suggestions dismissed');
      await fetchSuggestions();
    } catch (error) {
      toast.error('Failed to dismiss suggestions');
    }
  }, [suggestions, fetchSuggestions]);

  return {
    suggestions,
    isLoading,
    applySuggestions,
    dismissSuggestions,
    refetch: fetchSuggestions
  };
}
