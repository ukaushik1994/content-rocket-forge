import { supabase } from '@/integrations/supabase/client';
import { WebsiteConnection, SaveWordPressConnectionParams, SaveWixConnectionParams } from './types';

export async function getConnection(provider: 'wordpress' | 'wix'): Promise<WebsiteConnection | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('website_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No row found
        return null;
      }
      console.error('Error fetching website connection:', error);
      return null;
    }

    return data as WebsiteConnection;
  } catch (error) {
    console.error('Error in getConnection:', error);
    return null;
  }
}

export async function saveWordPressConnection(config: SaveWordPressConnectionParams): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Delete any existing Wix connection (enforce single connection)
    await supabase
      .from('website_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', 'wix');

    const { error } = await supabase
      .from('website_connections')
      .upsert({
        user_id: user.id,
        provider: 'wordpress',
        site_url: config.siteUrl,
        username: config.username,
        app_password: config.appPassword,
        is_active: true,
        connection_status: 'unconfigured',
        default_settings: config.defaultSettings || {
          status: 'draft',
          categories: [],
          tags: [],
          auto_publish: false
        }
      }, {
        onConflict: 'user_id,provider'
      });

    if (error) {
      console.error('Error saving WordPress connection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveWordPressConnection:', error);
    return false;
  }
}

export async function saveWixConnection(config: SaveWixConnectionParams): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Delete any existing WordPress connection (enforce single connection)
    await supabase
      .from('website_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', 'wordpress');

    const { error } = await supabase
      .from('website_connections')
      .upsert({
        user_id: user.id,
        provider: 'wix',
        site_id: config.siteId,
        api_key: config.apiKey,
        is_active: true,
        connection_status: 'unconfigured'
      }, {
        onConflict: 'user_id,provider'
      });

    if (error) {
      console.error('Error saving Wix connection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveWixConnection:', error);
    return false;
  }
}

export async function testConnection(provider: 'wordpress' | 'wix'): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Update status to testing
    await supabase
      .from('website_connections')
      .update({ connection_status: 'testing' })
      .eq('user_id', user.id)
      .eq('provider', provider);

    // Call edge function to test connection
    const functionName = provider === 'wordpress' ? 'test-wordpress-connection' : 'test-wix-connection';
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: { provider }
    });

    const success = data?.success || false;

    // Update connection status
    await supabase
      .from('website_connections')
      .update({
        connection_status: success ? 'connected' : 'error',
        last_tested_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('provider', provider);

    return success;
  } catch (error) {
    console.error('Error testing connection:', error);
    return false;
  }
}

export async function toggleConnectionStatus(provider: 'wordpress' | 'wix', isActive: boolean): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('website_connections')
      .update({ is_active: isActive })
      .eq('user_id', user.id)
      .eq('provider', provider);

    if (error) {
      console.error('Error toggling connection status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in toggleConnectionStatus:', error);
    return false;
  }
}

export async function deleteConnection(provider: 'wordpress' | 'wix'): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('website_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider);

    if (error) {
      console.error('Error deleting connection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteConnection:', error);
    return false;
  }
}