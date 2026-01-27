import { supabase } from '@/integrations/supabase/client';
import { discoverCompanyInfo } from './companyIntelService';
import { autoFillFromWebsite as competitorAutoFill } from './competitorIntelService';
import { autoFillFromWebsite as solutionAutoFill } from './solutionIntelService';
import { toast } from '@/hooks/use-toast';

export interface OnboardingSetupData {
  companyUrl: string;
  competitors: string[];
  solutions: Array<{ name: string; description: string }>;
}

interface IntelResult {
  type: 'company' | 'competitor' | 'solution';
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Process onboarding setup data and trigger background intelligence gathering.
 * This function is non-blocking - it runs in the background after the user closes the modal.
 */
export async function processOnboardingSetup(
  userId: string,
  data: OnboardingSetupData
): Promise<void> {
  console.log('🚀 Starting onboarding intelligence gathering...');
  
  const results: IntelResult[] = [];
  
  try {
    // Extract domain from company URL for company name
    const companyDomain = new URL(data.companyUrl).hostname.replace('www.', '');
    const companyName = companyDomain.split('.')[0];

    // Create all intel promises
    const promises: Promise<IntelResult>[] = [];

    // 1. Company Intel
    promises.push(
      discoverCompanyInfo(companyName, data.companyUrl, userId)
        .then(result => {
          if (result) {
            return saveCompanyInfo(userId, result.companyInfo);
          }
          return { type: 'company' as const, success: false, error: 'No data returned' };
        })
        .catch(error => ({ 
          type: 'company' as const, 
          success: false, 
          error: error.message 
        }))
    );

    // 2. Competitor Intel (for each competitor URL)
    for (const competitorUrl of data.competitors) {
      promises.push(
        competitorAutoFill(competitorUrl, userId)
          .then(result => {
            if (result) {
              return saveCompetitor(userId, competitorUrl, result.profile);
            }
            return { type: 'competitor' as const, success: false, error: 'No data returned' };
          })
          .catch(error => ({ 
            type: 'competitor' as const, 
            success: false, 
            error: error.message 
          }))
      );
    }

    // 3. Solution Intel - use company URL to discover solutions, then merge with user-provided data
    promises.push(
      solutionAutoFill(data.companyUrl, userId)
        .then(result => {
          if (result?.solutions) {
            return saveSolutions(userId, data.solutions, result.solutions);
          }
          // Even if AI extraction fails, save user-provided solutions
          return saveSolutions(userId, data.solutions, []);
        })
        .catch(error => {
          console.warn('Solution intel failed, saving user-provided data:', error);
          // Still save user-provided solutions
          return saveSolutions(userId, data.solutions, []);
        })
    );

    // Wait for all to complete (non-blocking from user perspective)
    const allResults = await Promise.allSettled(promises);
    
    allResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`Intel promise ${index} failed:`, result.reason);
      }
    });

    // Calculate success rate
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    // Update onboarding_setup status
    await supabase.from('onboarding_setup').update({
      intel_status: successCount > 0 ? 'completed' : 'failed',
      completed_at: new Date().toISOString()
    }).eq('user_id', userId);

    // Show completion toast
    if (successCount === totalCount) {
      toast({
        title: "Your business profile is ready! ✨",
        description: "We've analyzed your company, competitors, and solutions.",
      });
    } else if (successCount > 0) {
      toast({
        title: "Setup partially complete",
        description: `Successfully processed ${successCount} of ${totalCount} items. Some data may need manual review.`,
      });
    } else {
      toast({
        title: "Setup needs attention",
        description: "We couldn't gather some information. You can add details manually in Settings.",
        variant: "destructive"
      });
    }

    console.log('✅ Onboarding intel complete:', { successCount, totalCount, results });

  } catch (error) {
    console.error('❌ Onboarding intel error:', error);
    
    // Update status to failed
    await supabase.from('onboarding_setup').update({
      intel_status: 'failed'
    }).eq('user_id', userId);

    toast({
      title: "Setup encountered an error",
      description: "You can add your business details manually in Settings.",
      variant: "destructive"
    });
  }
}

async function saveCompanyInfo(userId: string, companyInfo: any): Promise<IntelResult> {
  try {
    // Check if company already exists for this user
    const { data: existing } = await supabase
      .from('company_info')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      // Update existing
      await supabase.from('company_info').update({
        name: companyInfo.name || 'My Company',
        description: companyInfo.description,
        industry: companyInfo.industry,
        website: companyInfo.website,
        mission: companyInfo.mission,
        size: companyInfo.size,
        founded: companyInfo.founded,
        values: companyInfo.values,
        updated_at: new Date().toISOString()
      }).eq('id', existing.id);
    } else {
      // Insert new
      await supabase.from('company_info').insert({
        user_id: userId,
        name: companyInfo.name || 'My Company',
        description: companyInfo.description,
        industry: companyInfo.industry,
        website: companyInfo.website,
        mission: companyInfo.mission,
        size: companyInfo.size,
        founded: companyInfo.founded,
        values: companyInfo.values
      });
    }

    console.log('✅ Company info saved');
    return { type: 'company', success: true, data: companyInfo };
  } catch (error: any) {
    console.error('Failed to save company info:', error);
    return { type: 'company', success: false, error: error.message };
  }
}

async function saveCompetitor(userId: string, url: string, profile: any): Promise<IntelResult> {
  try {
    // Extract name from URL if not provided
    const domain = new URL(url).hostname.replace('www.', '');
    const name = profile.name || domain.split('.')[0];

    await supabase.from('company_competitors').insert({
      user_id: userId,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      website: url,
      description: profile.description,
      market_position: profile.market_position,
      strengths: profile.strengths,
      weaknesses: profile.weaknesses,
      resources: profile.resources,
      notes: profile.notes,
      intelligence_data: {
        company_size: profile.company_size,
        founded_year: profile.founded_year,
        headquarters: profile.headquarters,
        funding_stage: profile.funding_stage,
        employee_count: profile.employee_count,
        customer_count: profile.customer_count,
        product_categories: profile.product_categories,
        key_features: profile.key_features,
        pricing_model: profile.pricing_model,
        pricing_tiers: profile.pricing_tiers,
        has_free_trial: profile.has_free_trial,
        has_free_plan: profile.has_free_plan,
        target_industries: profile.target_industries,
        notable_customers: profile.notable_customers,
        unique_value_propositions: profile.unique_value_propositions,
        key_differentiators: profile.key_differentiators
      }
    });

    console.log('✅ Competitor saved:', name);
    return { type: 'competitor', success: true, data: profile };
  } catch (error: any) {
    console.error('Failed to save competitor:', error);
    return { type: 'competitor', success: false, error: error.message };
  }
}

async function saveSolutions(
  userId: string, 
  userSolutions: Array<{ name: string; description: string }>,
  aiSolutions: any[]
): Promise<IntelResult> {
  try {
    const solutionsToSave = userSolutions.map(userSol => {
      // Try to find matching AI solution by name similarity
      const aiMatch = aiSolutions.find(ai => 
        ai.name?.toLowerCase().includes(userSol.name.toLowerCase()) ||
        userSol.name.toLowerCase().includes(ai.name?.toLowerCase() || '')
      );

      return {
        user_id: userId,
        name: userSol.name,
        short_description: userSol.description || aiMatch?.short_description,
        long_description: aiMatch?.long_description,
        features: aiMatch?.features,
        benefits: aiMatch?.benefits,
        pain_points: aiMatch?.pain_points,
        target_audience: aiMatch?.target_audience,
        unique_selling_points: aiMatch?.unique_selling_points,
        pricing_info: aiMatch?.pricing_info,
        integrations: aiMatch?.integrations,
        use_cases: aiMatch?.use_cases,
        category: aiMatch?.category,
        tags: aiMatch?.tags
      };
    });

    if (solutionsToSave.length > 0) {
      const { error } = await supabase.from('solutions').insert(solutionsToSave);
      if (error) throw error;
    }

    console.log('✅ Solutions saved:', solutionsToSave.length);
    return { type: 'solution', success: true, data: solutionsToSave };
  } catch (error: any) {
    console.error('Failed to save solutions:', error);
    return { type: 'solution', success: false, error: error.message };
  }
}
