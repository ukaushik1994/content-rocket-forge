import { supabase } from '@/integrations/supabase/client';
import { SWOTResponse, SWOTAnalysis } from '@/types/competitor-swot';

export async function generateCompetitorSWOT(
  competitorId: string,
  competitorName: string,
  competitorData: {
    description?: string;
    intelligenceData?: any;
    strengths: string[];
    weaknesses: string[];
    solutions?: any[];
  },
  userId: string,
  userCompanyInfo?: any,
  userSolutions?: any[]
): Promise<SWOTAnalysis | null> {
  try {
    console.log('🎯 Generating SWOT analysis for:', competitorName);

    const { data, error } = await supabase.functions.invoke('competitor-swot', {
      body: {
        userId,
        competitorId,
        competitorName,
        competitorData,
        userCompanyInfo,
        userSolutions
      }
    });

    if (error) {
      console.error('❌ SWOT analysis error:', error);
      return null;
    }

    if (!data?.success || !data?.analysis) {
      console.warn('⚠️ No SWOT analysis returned');
      return null;
    }

    console.log('✅ SWOT analysis complete:', {
      opportunities: data.analysis.opportunities.length,
      threats: data.analysis.threats.length,
      score: data.analysis.competitiveScore
    });

    return data.analysis;
  } catch (error) {
    console.error('💥 SWOT generation exception:', error);
    return null;
  }
}
