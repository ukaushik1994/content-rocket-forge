import { supabase } from '@/integrations/supabase/client';
import { CompanyInfo } from '@/contexts/content-builder/types/company-types';

export interface CompanyAutoFillResult {
  companyInfo: CompanyInfo;
  metadata: {
    sourceUrls: string[];
    confidenceScores: Record<string, number>;
    pagesAnalyzed: number;
    extractionDate: string;
  };
}

/**
 * Auto-fill company information from website using SERP + AI extraction
 */
export async function discoverCompanyInfo(
  companyName: string,
  website: string,
  userId: string
): Promise<CompanyAutoFillResult | null> {
  try {
    console.log('🔍 Calling company-intel edge function for:', companyName, website);

    const { data, error } = await supabase.functions.invoke('company-intel', {
      body: {
        userId,
        companyName,
        website,
        maxPages: 5
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to discover company information');
    }

    if (!data || !data.success) {
      console.error('Edge function returned error:', data);
      throw new Error(data?.error || 'Failed to extract company data');
    }

    console.log('✅ Company intelligence complete:', {
      pagesAnalyzed: data.metadata?.pagesAnalyzed || 0,
      confidenceScores: data.metadata?.confidenceScores
    });

    return {
      companyInfo: data.companyInfo,
      metadata: data.metadata || {
        sourceUrls: [],
        confidenceScores: {},
        pagesAnalyzed: 0,
        extractionDate: new Date().toISOString()
      }
    };
  } catch (error: any) {
    console.error('Company intel service error:', error);
    throw error;
  }
}
