/**
 * Manual sync utilities for debugging API key issues
 */

import { syncApiKeysToProviders } from './providerSync';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Force manual sync and provide detailed feedback
 */
export async function forceSyncApiKeys(): Promise<void> {
  try {
    console.log('🚀 MANUAL SYNC: Starting forced API key sync...');
    
    // Check current state
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Check existing API keys
    const { data: apiKeys, error: keysError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id);
      
    console.log('📊 Current API Keys:', apiKeys?.length || 0, apiKeys);
    
    // Check existing providers
    const { data: providers, error: providersError } = await supabase
      .from('ai_service_providers')
      .select('*')
      .eq('user_id', user.id);
      
    console.log('📊 Current AI Providers:', providers?.length || 0, providers);
    
    // Run the sync
    const success = await syncApiKeysToProviders();
    
    if (success) {
      // Check results
      const { data: newProviders } = await supabase
        .from('ai_service_providers')
        .select('*')
        .eq('user_id', user.id);
        
      console.log('✅ SYNC COMPLETE - New provider count:', newProviders?.length || 0);
      toast.success(`Sync complete! ${newProviders?.length || 0} providers configured`);
    } else {
      console.error('❌ SYNC FAILED');
      toast.error('Manual sync failed - check console for details');
    }
  } catch (error) {
    console.error('❌ MANUAL SYNC ERROR:', error);
    toast.error(`Manual sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Debug API key and provider status
 */
export async function debugApiKeyStatus(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ No authenticated user');
      return;
    }
    
    console.log('🔍 DEBUG: Checking API key status for user:', user.id);
    
    // Check API keys table
    const { data: apiKeys, error: keysError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id);
      
    console.log('🔑 API Keys in database:', {
      count: apiKeys?.length || 0,
      keys: apiKeys?.map(k => ({ 
        service: k.service, 
        active: k.is_active, 
        hasKey: !!k.encrypted_key,
        created: k.created_at 
      })) || []
    });
    
    // Check providers table
    const { data: providers, error: providersError } = await supabase
      .from('ai_service_providers')
      .select('*')
      .eq('user_id', user.id);
      
    console.log('🤖 AI Service Providers in database:', {
      count: providers?.length || 0,
      providers: providers?.map(p => ({ 
        provider: p.provider, 
        status: p.status, 
        hasApiKey: !!p.api_key,
        priority: p.priority 
      })) || []
    });
    
    // Test decryption for each API key
    const { getApiKey } = await import('../apiKeyService');
    for (const key of apiKeys || []) {
      try {
        const decrypted = await getApiKey(key.service as any);
        console.log(`🔓 ${key.service} decryption:`, decrypted ? '✅ Success' : '❌ Failed');
      } catch (error) {
        console.log(`🔓 ${key.service} decryption: ❌ Error -`, error);
      }
    }
    
    toast.info('Debug complete - check console for details');
  } catch (error) {
    console.error('❌ DEBUG ERROR:', error);
    toast.error('Debug failed - check console');
  }
}

// Add to window object for easy access from dev console
if (typeof window !== 'undefined') {
  (window as any).forceAISync = forceSyncApiKeys;
  (window as any).debugAIKeys = debugApiKeyStatus;
}