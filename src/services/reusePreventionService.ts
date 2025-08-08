import { supabase } from '@/integrations/supabase/client';

export interface ReuseCheckResult {
  reused: boolean;
  overlapPercent: number;
  matched: {
    faqs: string[];
    headings: string[];
    titles: string[];
  };
}

export async function checkReuse(primaryKeyword: string, usedFaqs: string[], usedHeadings: string[], usedTitles: string[] = []): Promise<ReuseCheckResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke('check-reuse', {
      body: {
        primary_keyword: primaryKeyword,
        used_faqs: usedFaqs,
        used_headings: usedHeadings,
        used_titles: usedTitles,
      },
    });

    if (error) {
      console.error('[reusePreventionService] check-reuse error:', error);
      return null;
    }

    return data as ReuseCheckResult;
  } catch (e) {
    console.error('[reusePreventionService] Unexpected error:', e);
    return null;
  }
}
