import { supabase } from '@/integrations/supabase/client';
import { getConnection } from '@/services/websiteConnection';
import { PublishInput, PublishResult } from './types';

export async function getActiveConnection(): Promise<{
  provider: 'wordpress' | 'wix' | null;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { provider: null };

    // Check WordPress first
    const wpConnection = await getConnection('wordpress');
    if (wpConnection && wpConnection.is_active) {
      return { provider: 'wordpress' };
    }

    // Check Wix
    const wixConnection = await getConnection('wix');
    if (wixConnection && wixConnection.is_active) {
      return { provider: 'wix' };
    }

    return { provider: null };
  } catch (error) {
    console.error('Error getting active connection:', error);
    return { provider: null };
  }
}

export async function publishToWebsite(input: PublishInput): Promise<PublishResult> {
  try {
    const { provider } = await getActiveConnection();

    if (!provider) {
      return {
        ok: false,
        error: 'No active website connection found'
      };
    }

    const functionName = provider === 'wordpress' ? 'publish-wordpress' : 'publish-wix';
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: input
    });

    if (error) {
      console.error(`Error calling ${functionName}:`, error);
      return {
        ok: false,
        error: error.message || 'Failed to publish to website'
      };
    }

    return data as PublishResult;
  } catch (error) {
    console.error('Error in publishToWebsite:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
