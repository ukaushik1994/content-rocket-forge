import { supabase } from '@/integrations/supabase/client';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

export interface CompetitorIntelResult {
  profile: CompetitorAutoFillPayload;
  diagnostics: any;
}

export async function autoFillFromWebsite(
  website: string,
  userId: string,
  competitorId?: string
): Promise<CompetitorIntelResult | null> {
  try {
    console.log('🔍 Auto-filling competitor intel for:', website);
    
    const { data, error } = await supabase.functions.invoke('competitor-intel', {
      body: { userId, website, competitorId }
    });
    
    if (error) {
      console.error('❌ Competitor intel error:', error);
      
      // Provide helpful error messages
      if (error.message?.includes('rate limit')) {
        throw new Error('SERP API rate limit reached. Using fallback crawling method (may take longer).');
      }
      throw new Error(error.message || 'Failed to extract intelligence');
    }
    
    if (!data?.success) {
      console.warn('⚠️ Extraction failed:', data?.error);
      
      // Provide context-specific error messages
      if (data?.error?.includes('No competitor pages found')) {
        throw new Error('Could not discover pages automatically. Please enter information manually.');
      } else if (data?.error?.includes('blocking automated access')) {
        throw new Error('Website may be blocking automated access. Please try again later or enter manually.');
      } else if (data?.error?.includes('rate limit')) {
        throw new Error('API rate limit reached. Using fallback method...');
      }
      
      throw new Error(data?.error || 'Failed to extract intelligence data');
    }
    
    if (!data?.profile) {
      console.warn('⚠️ No profile data returned');
      throw new Error('No data could be extracted. Please enter information manually.');
    }
    
    console.log('✅ Auto-fill complete:', data.diagnostics);
    return {
      profile: data.profile,
      diagnostics: data.diagnostics
    };
    
  } catch (error: any) {
    console.error('💥 Auto-fill exception:', error);
    // Re-throw with the error message so it can be displayed to the user
    throw error;
  }
}
