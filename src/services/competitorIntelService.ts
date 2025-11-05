import { supabase } from '@/integrations/supabase/client';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

export interface CompetitorIntelResult {
  profile: CompetitorAutoFillPayload;
  diagnostics: any;
}

export async function autoFillFromWebsite(
  website: string,
  userId: string
): Promise<CompetitorIntelResult | null> {
  try {
    console.log('🔍 Auto-filling competitor intel for:', website);
    
    const { data, error } = await supabase.functions.invoke('competitor-intel', {
      body: { userId, website }
    });
    
    if (error) {
      console.error('❌ Competitor intel error:', error);
      return null;
    }
    
    if (!data?.success || !data?.profile) {
      console.warn('⚠️ No profile data returned');
      return null;
    }
    
    console.log('✅ Auto-fill complete:', data.diagnostics);
    return {
      profile: data.profile,
      diagnostics: data.diagnostics
    };
    
  } catch (error) {
    console.error('💥 Auto-fill exception:', error);
    return null;
  }
}
