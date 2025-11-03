import { supabase } from '@/integrations/supabase/client';
import { CompetitorSolution } from '@/contexts/content-builder/types/company-types';

export async function discoverCompetitorSolutions(
  competitorId: string,
  competitorWebsite: string,
  competitorName: string,
  userId: string
): Promise<{ solutions: CompetitorSolution[]; diagnostics: any }> {
  try {
    console.log('🔍 Discovering solutions for competitor:', competitorName);

    const { data, error } = await supabase.functions.invoke('competitor-solutions', {
      body: {
        competitorId,
        competitorWebsite,
        competitorName,
        userId
      }
    });

    if (error) {
      console.error('❌ Discovery error:', error);
      throw new Error(error.message || 'Failed to discover solutions');
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'Solution discovery failed');
    }

    console.log('✅ Discovery complete:', {
      solutions: data.solutions?.length || 0,
      diagnostics: data.diagnostics
    });

    return {
      solutions: data.solutions || [],
      diagnostics: data.diagnostics || {}
    };
  } catch (error: any) {
    console.error('💥 Discovery service error:', error);
    throw error;
  }
}

export async function getCompetitorSolutions(
  competitorId: string
): Promise<CompetitorSolution[]> {
  try {
    const { data, error } = await supabase
      .from('competitor_solutions')
      .select('*')
      .eq('competitor_id', competitorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch solutions:', error);
      throw error;
    }

    // Map snake_case database fields to camelCase TypeScript
    return (data || []).map((row: any) => ({
      id: row.id,
      competitorId: row.competitor_id,
      userId: row.user_id,
      name: row.name,
      category: row.category,
      shortDescription: row.short_description,
      longDescription: row.long_description,
      externalUrl: row.external_url,
      logoUrl: row.logo_url,
      positioning: row.positioning,
      uniqueValuePropositions: (Array.isArray(row.unique_value_propositions) ? row.unique_value_propositions : []) as any[],
      keyDifferentiators: (Array.isArray(row.key_differentiators) ? row.key_differentiators : []) as any[],
      features: (Array.isArray(row.features) ? row.features : []) as any[],
      useCases: (Array.isArray(row.use_cases) ? row.use_cases : []) as any[],
      painPoints: (Array.isArray(row.pain_points) ? row.pain_points : []) as any[],
      targetAudience: (Array.isArray(row.target_audience) ? row.target_audience : []) as any[],
      benefits: (Array.isArray(row.benefits) ? row.benefits : []) as any[],
      pricing: row.pricing,
      technicalSpecs: row.technical_specs,
      integrations: (Array.isArray(row.integrations) ? row.integrations : []) as any[],
      caseStudies: (Array.isArray(row.case_studies) ? row.case_studies : []) as any[],
      resources: (Array.isArray(row.resources) ? row.resources : []) as any[],
      tags: (Array.isArray(row.tags) ? row.tags : []) as any[],
      marketData: row.market_data,
      discoverySource: row.discovery_source,
      lastAnalyzedAt: row.last_analyzed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error: any) {
    console.error('💥 Get solutions error:', error);
    throw error;
  }
}

export async function refreshCompetitorSolution(
  solutionId: string,
  externalUrl: string,
  userId: string
): Promise<CompetitorSolution> {
  try {
    console.log('🔄 Refreshing solution:', solutionId);

    const { data, error } = await supabase.functions.invoke('solution-intel', {
      body: {
        userId,
        website: externalUrl,
        maxPages: 5,
        detectMultiple: false,
        recrawl: true
      }
    });

    if (error || !data?.success || !data.solutions?.length) {
      throw new Error('Failed to refresh solution data');
    }

    const refreshedData = data.solutions[0];
    
    const { data: updated, error: updateError } = await supabase
      .from('competitor_solutions')
      .update({
        long_description: refreshedData.description,
        features: refreshedData.features || [],
        use_cases: refreshedData.useCases || [],
        pricing: refreshedData.pricing,
        last_analyzed_at: new Date().toISOString()
      })
      .eq('id', solutionId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Map the response
    const mapped: CompetitorSolution = {
      id: updated.id,
      competitorId: updated.competitor_id,
      userId: updated.user_id,
      name: updated.name,
      category: updated.category,
      shortDescription: updated.short_description,
      longDescription: updated.long_description,
      externalUrl: updated.external_url,
      logoUrl: updated.logo_url,
      positioning: updated.positioning,
      uniqueValuePropositions: (Array.isArray(updated.unique_value_propositions) ? updated.unique_value_propositions : []) as any[],
      keyDifferentiators: (Array.isArray(updated.key_differentiators) ? updated.key_differentiators : []) as any[],
      features: (Array.isArray(updated.features) ? updated.features : []) as any[],
      useCases: (Array.isArray(updated.use_cases) ? updated.use_cases : []) as any[],
      painPoints: (Array.isArray(updated.pain_points) ? updated.pain_points : []) as any[],
      targetAudience: (Array.isArray(updated.target_audience) ? updated.target_audience : []) as any[],
      benefits: (Array.isArray(updated.benefits) ? updated.benefits : []) as any[],
      pricing: updated.pricing,
      technicalSpecs: updated.technical_specs,
      integrations: (Array.isArray(updated.integrations) ? updated.integrations : []) as any[],
      caseStudies: (Array.isArray(updated.case_studies) ? updated.case_studies : []) as any[],
      resources: (Array.isArray(updated.resources) ? updated.resources : []) as any[],
      tags: (Array.isArray(updated.tags) ? updated.tags : []) as any[],
      marketData: updated.market_data,
      discoverySource: updated.discovery_source,
      lastAnalyzedAt: updated.last_analyzed_at,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };

    console.log('✅ Solution refreshed successfully');
    return mapped;
  } catch (error: any) {
    console.error('💥 Refresh error:', error);
    throw error;
  }
}
