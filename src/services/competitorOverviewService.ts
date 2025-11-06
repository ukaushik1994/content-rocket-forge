import { supabase } from '@/integrations/supabase/client';
import { OverviewResponse, CompetitorOverview } from '@/types/competitor-overview';

export async function generateCompetitorOverview(
  competitorId: string,
  competitorName: string,
  competitorData: {
    description?: string;
    website?: string;
    intelligenceData?: any;
    strengths: string[];
    weaknesses: string[];
    solutions?: any[];
    swotAnalysis?: any;
  },
  userId: string,
  userCompanyInfo?: any
): Promise<CompetitorOverview | null> {
  try {
    console.log('📊 Generating overview for:', competitorName);

    const { data, error } = await supabase.functions.invoke('competitor-overview', {
      body: {
        userId,
        competitorId,
        competitorName,
        competitorData,
        userCompanyInfo
      }
    });

    if (error) {
      console.error('❌ Overview generation error:', error);
      return null;
    }

    if (!data?.success || !data?.overview) {
      console.warn('⚠️ No overview returned');
      return null;
    }

    console.log('✅ Overview generated:', {
      insights: data.overview.topInsights.length,
      actions: data.overview.recommendedActions.length
    });

    return data.overview;
  } catch (error) {
    console.error('💥 Overview generation exception:', error);
    return null;
  }
}
