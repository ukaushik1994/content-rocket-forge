import { supabase } from '@/integrations/supabase/client';

export interface CampaignInput {
  idea: string;
  targetAudience?: string;
  goal?: string;
  timeline?: string;
  solutionId?: string;
  useSerpData?: boolean;
  useCompetitorData?: boolean;
}

export interface CampaignStrategy {
  title: string;
  description: string;
  contentTypes: string[];
  timeline: string;
  [key: string]: any;
}

export async function createCampaignAtomic(
  userId: string,
  title: string,
  description: string,
  input: CampaignInput,
  strategy: CampaignStrategy
) {
  const { data, error } = await supabase.rpc('create_campaign_atomic' as any, {
    p_user_id: userId,
    p_title: title,
    p_description: description,
    p_status: 'draft',
    p_input: input as any,
    p_strategy: strategy as any
  });
  
  if (error) {
    console.error('❌ Campaign creation failed (rolled back):', error);
    throw new Error(`Failed to create campaign: ${error.message}`);
  }
  
  console.log('✅ Campaign created atomically:', (data as any).id);
  return data as any;
}
