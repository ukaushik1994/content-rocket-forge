import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export async function getApiKey(service: string, userId?: string): Promise<string | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', service)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.log(`No ${service} API key found for user ${userId}`);
      return null;
    }

    // For now, return the encrypted key as-is since we don't have decryption setup
    // In production, this would decrypt the key properly
    return data.encrypted_key;
  } catch (error) {
    console.error(`Error fetching ${service} API key:`, error);
    return null;
  }
}