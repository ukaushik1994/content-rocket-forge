import { supabase } from '@/integrations/supabase/client';
import { SolutionAutoFillResult } from '@/types/solution-intel';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';

export async function autoFillFromWebsite(
  website: string,
  userId: string,
  options?: { recrawl?: boolean }
): Promise<SolutionAutoFillResult | null> {
  try {
    console.log('🔍 Calling solution-intel edge function for:', website);

    const { data, error } = await supabase.functions.invoke('solution-intel', {
      body: {
        userId,
        website,
        maxPages: 20,
        detectMultiple: true,
        recrawl: options?.recrawl || false
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to analyze website');
    }

    if (!data || !data.success) {
      console.error('Edge function returned error:', data);
      throw new Error(data?.error || 'Failed to extract solution data');
    }

    console.log('✅ Solution intelligence complete:', {
      solutions: data.solutions?.length || 0,
      multipleDetected: data.multipleDetected,
      diagnostics: data.diagnostics
    });

    return {
      solutions: data.solutions || [],
      multipleDetected: data.multipleDetected || false,
      diagnostics: data.diagnostics || {
        used_sitemap: false,
        used_serp: false,
        pages_fetched: 0,
        products_detected: 0,
        confidence: 0
      }
    };
  } catch (error: any) {
    console.error('Solution intel service error:', error);
    throw error;
  }
}
