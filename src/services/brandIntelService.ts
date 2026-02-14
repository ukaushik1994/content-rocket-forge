import { supabase } from '@/integrations/supabase/client';
import { BrandGuidelines } from '@/contexts/content-builder/types/company-types';

export interface BrandIntelResult {
  brandGuidelines: BrandGuidelines;
  metadata: {
    sourceUrls: string[];
    pagesAnalyzed: number;
    extractionDate: string;
  };
  confidenceScores: Record<string, number>;
}

/**
 * Call the brand-intel edge function to extract brand guidelines from a website
 */
export async function discoverBrandGuidelines(
  website: string,
  userId: string
): Promise<BrandIntelResult | null> {
  try {
    console.log('[brandIntelService] Starting brand extraction for:', website);

    const { data, error } = await supabase.functions.invoke('brand-intel', {
      body: { website, userId }
    });

    if (error) {
      console.error('[brandIntelService] Edge function error:', error);
      return null;
    }

    if (!data?.success || !data?.brandGuidelines) {
      console.warn('[brandIntelService] No brand data returned:', data?.error);
      return null;
    }

    const bg = data.brandGuidelines;

    const brandGuidelines: BrandGuidelines = {
      id: '',
      companyId: '',
      primaryColor: bg.primaryColor || '#3B82F6',
      secondaryColor: bg.secondaryColor || '#10B981',
      accentColor: bg.accentColor || '#F59E0B',
      neutralColor: bg.neutralColor || '#6B7280',
      fontFamily: bg.fontFamily || 'Inter',
      secondaryFontFamily: bg.secondaryFontFamily || 'system-ui',
      tone: Array.isArray(bg.tone) ? bg.tone : [],
      keywords: Array.isArray(bg.keywords) ? bg.keywords : [],
      brandPersonality: bg.brandPersonality || '',
      missionStatement: bg.missionStatement || '',
      doUse: Array.isArray(bg.doUse) ? bg.doUse : [],
      dontUse: Array.isArray(bg.dontUse) ? bg.dontUse : [],
      logoUsageNotes: bg.logoUsageNotes || '',
      imageryGuidelines: bg.imageryGuidelines || '',
      targetAudience: bg.targetAudience || '',
      brandStory: bg.brandStory || '',
      brandValues: bg.brandValues || '',
      brandAssetsUrl: '',
    };

    return {
      brandGuidelines,
      metadata: data.metadata,
      confidenceScores: bg.confidenceScores || { overall: 0.5 },
    };
  } catch (error) {
    console.error('[brandIntelService] Error:', error);
    return null;
  }
}

/**
 * Extract brand guidelines and save directly to the database
 */
export async function extractAndSaveBrandGuidelines(
  website: string,
  userId: string,
  companyId: string
): Promise<BrandGuidelines | null> {
  const result = await discoverBrandGuidelines(website, userId);
  if (!result) return null;

  const bg = result.brandGuidelines;
  bg.companyId = companyId;

  try {
    // Check if brand guidelines already exist
    const { data: existing } = await supabase
      .from('brand_guidelines')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    const brandData = {
      user_id: userId,
      company_id: companyId,
      primary_color: bg.primaryColor,
      secondary_color: bg.secondaryColor,
      accent_color: bg.accentColor,
      neutral_color: bg.neutralColor,
      font_family: bg.fontFamily,
      secondary_font_family: bg.secondaryFontFamily,
      tone: bg.tone,
      keywords: bg.keywords,
      brand_personality: bg.brandPersonality,
      mission_statement: bg.missionStatement,
      do_use: bg.doUse,
      dont_use: bg.dontUse,
      logo_usage_notes: bg.logoUsageNotes,
      imagery_guidelines: bg.imageryGuidelines,
      target_audience: bg.targetAudience,
      brand_story: bg.brandStory,
      brand_values: bg.brandValues,
      updated_at: new Date().toISOString(),
    };

    let savedData;
    if (existing) {
      const { data, error } = await supabase
        .from('brand_guidelines')
        .update(brandData)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      savedData = data;
    } else {
      const { data, error } = await supabase
        .from('brand_guidelines')
        .insert(brandData)
        .select()
        .single();
      if (error) throw error;
      savedData = data;
    }

    return {
      id: savedData.id,
      ...bg,
    };
  } catch (error) {
    console.error('[brandIntelService] Error saving brand guidelines:', error);
    return null;
  }
}
