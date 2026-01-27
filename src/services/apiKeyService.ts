
import { supabase } from '@/integrations/supabase/client';
import { encryptApiKey, decryptApiKey, migrateApiKey } from './apiKeys/encryption';
import { detectApiKeyType as detectKeyType, validateApiKeyFormat } from './apiKeys/validation';
import { testApiKey as testKey } from './apiKeys/testing';
import { toast } from 'sonner';

// Updated type to include all API providers
export type ApiProvider = 
  | 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'lmstudio' | 'openrouter' 
  | 'serp' | 'serpapi' | 'serpstack'
  | 'openai_image' | 'gemini_image' | 'lmstudio_image'
  | 'runway_video' | 'kling_video' | 'replicate_video';

// Legacy type alias for backward compatibility
export type ApiService = ApiProvider;

/**
 * Secure API key management service with proper encryption
 */
class ApiKeyService {
  /**
   * Validate user authentication before API key operations
   */
  private static async validateUserAuth(): Promise<{ user: any; error?: string }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('❌ Auth validation error:', error);
        return { user: null, error: 'Authentication failed. Please log in again.' };
      }
      
      if (!user) {
        return { user: null, error: 'You must be logged in to manage API keys' };
      }
      
      console.log('✅ User authentication validated:', user.id);
      return { user };
    } catch (error: any) {
      console.error('❌ Auth validation exception:', error);
      return { user: null, error: 'Authentication check failed' };
    }
  }

  /**
   * Stores an encrypted API key for a service
   */
  static async storeApiKey(service: ApiProvider, apiKey: string): Promise<boolean> {
    try {
      // Normalize serpapi alias to serp
      const normalizedService = service === 'serpapi' ? 'serp' : service;
      console.log(`💾 Starting API key storage for ${normalizedService}${service !== normalizedService ? ` (from ${service})` : ''}...`);
      
      // Use normalized service for all operations
      const effectiveService = normalizedService;
      
      // Validate inputs
      if (!effectiveService || typeof effectiveService !== 'string') {
        toast.error('Invalid service specified');
        return false;
      }
      
      if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
        toast.error('Invalid API key provided');
        return false;
      }

      // Validate user authentication - Fixed: Use ApiKeyService instead of this
      const { user, error: authError } = await ApiKeyService.validateUserAuth();
      if (authError) {
        toast.error(authError);
        return false;
      }

      // Validate API key format using the imported function - PERMISSIVE MODE
      console.log(`🔍 Validating ${effectiveService} API key format (permissive mode)...`);
      
      // Try to detect the API key type - this is now ADVISORY only, not blocking
      const detectedType = detectKeyType(apiKey.trim());
      if (detectedType && detectedType !== effectiveService && detectedType !== 'serp') {
        console.warn(`⚠️ Advisory: Detected ${detectedType} key format but user selected ${effectiveService}`);
        // Show as info toast, not error - let user proceed
        toast.info(`Note: This key looks like a ${detectedType} key. Saving as ${effectiveService} anyway.`, { duration: 4000 });
      }
      
      // Use permissive validation - only reject truly invalid keys
      if (!validateApiKeyFormat(effectiveService, apiKey.trim(), false)) {
        // Only fail on truly invalid keys (too short, has whitespace, etc.)
        toast.error(`API key is invalid (too short or contains spaces). Please check and try again.`);
        return false;
      }
      console.log(`✅ ${effectiveService} API key format validation passed (permissive)`);

      // Encrypt the API key using the new secure encryption
      console.log(`🔐 Encrypting ${effectiveService} API key...`);
      const encryptedKey = await encryptApiKey(apiKey.trim(), user.id);
      console.log(`✅ ${effectiveService} API key encrypted successfully`);

      // Store in database with proper upsert logic
      console.log(`💾 Storing encrypted ${effectiveService} API key in database...`);
      const { error: dbError } = await supabase
        .from('api_keys')
        .upsert({
          user_id: user.id,
          service: effectiveService,
          encrypted_key: encryptedKey,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,service'
        });

      if (dbError) {
        console.error('❌ Database storage error:', dbError);
        toast.error('Failed to store API key in database');
        return false;
      }

      console.log(`✅ ${effectiveService} API key stored successfully`);
      toast.success(`${effectiveService} API key stored securely`);
      return true;
    } catch (error: any) {
      console.error(`❌ Error storing ${service} API key:`, {
        message: error.message,
        name: error.name,
        stack: error.stack,
        service,
        apiKeyLength: apiKey?.length || 0
      });
      
      // Provide user-friendly error messages
      if (error.message.includes('browser') || error.message.includes('crypto')) {
        toast.error('Your browser does not support secure API key storage. Please use a modern browser with HTTPS.');
      } else if (error.message.includes('encrypt')) {
        toast.error('Failed to encrypt API key. Please try again or contact support.');
      } else {
        toast.error(`Failed to store ${service} API key: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * Retrieves and decrypts an API key for a service
   */
  static async getApiKey(service: ApiProvider): Promise<string | null> {
    try {
      // Handle serpapi alias for serp
      const normalizedService = service === 'serpapi' ? 'serp' : service;
      console.log(`🔍 Retrieving ${service} API key (normalized to ${normalizedService})...`);
      
      // Validate user authentication - Fixed: Use ApiKeyService instead of this
      const { user, error: authError } = await ApiKeyService.validateUserAuth();
      if (authError) {
        console.warn(`⚠️ Auth error when retrieving ${service} API key:`, authError);
        return null;
      }

      const { data, error } = await supabase
        .from('api_keys')
        .select('encrypted_key')
        .eq('user_id', user.id)
        .eq('service', normalizedService)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.log(`ℹ️ No ${normalizedService} API key found in new table, checking legacy table...`);
        
        // Fallback to check the old user_llm_keys table
        try {
          const legacyKey = await ApiKeyService.getLegacyApiKey(user.id, normalizedService);
          if (legacyKey) {
            console.log(`✅ Found ${normalizedService} API key in legacy table`);
            return legacyKey;
          }
        } catch (legacyError: any) {
          console.warn(`⚠️ Error checking legacy table for ${normalizedService}:`, legacyError);
        }
        
        console.log(`ℹ️ No ${normalizedService} API key found in any table`);
        return null;
      }

      // Try to decrypt with new encryption method
      try {
        console.log(`🔓 Decrypting ${normalizedService} API key...`);
        const decryptedKey = await decryptApiKey(data.encrypted_key, user.id);
        console.log(`✅ ${normalizedService} API key decrypted successfully`);
        return decryptedKey;
      } catch (decryptError: any) {
        // Check if it's a legacy key that requires re-entry
        if (decryptError.message === 'LEGACY_KEY_REQUIRES_REENTRY' || decryptError.requiresReentry) {
          console.warn(`⚠️ ${service} API key requires re-entry (legacy format)`);
          toast.error(`Please re-enter your ${service} API key - security upgrade required`, {
            duration: 5000,
            id: `legacy-key-${service}` // Prevent duplicate toasts
          });
          return null;
        }
        
        // For other decryption errors, show a generic message
        console.error(`❌ ${service} API key decryption failed:`, decryptError.message);
        return null;
      }
    } catch (error: any) {
      console.error(`❌ Error retrieving ${service} API key:`, error);
      return null;
    }
  }

  /**
   * Deletes an API key for a service
   */
  static async deleteApiKey(service: ApiProvider): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting ${service} API key...`);
      
      // Validate user authentication - Fixed: Use ApiKeyService instead of this
      const { user, error: authError } = await ApiKeyService.validateUserAuth();
      if (authError) {
        toast.error(authError);
        return false;
      }

      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('user_id', user.id)
        .eq('service', service);

      if (error) {
        console.error(`❌ Error deleting ${service} API key:`, error);
        toast.error(`Failed to delete ${service} API key`);
        return false;
      }

      console.log(`✅ ${service} API key deleted successfully`);
      toast.success(`${service} API key deleted`);
      return true;
    } catch (error: any) {
      console.error(`❌ Error in deleteApiKey for ${service}:`, error);
      toast.error(`Failed to delete ${service} API key: ${error.message}`);
      return false;
    }
  }

  /**
   * Lists all configured API services for the user
   */
  static async getConfiguredServices(): Promise<ApiProvider[]> {
    try {
      console.log('📋 Retrieving configured services...');
      
      // Validate user authentication - Fixed: Use ApiKeyService instead of this
      const { user, error: authError } = await ApiKeyService.validateUserAuth();
      if (authError) {
        console.warn('⚠️ Auth error when retrieving configured services:', authError);
        return [];
      }

      // Use metadata view for security (no encrypted_key exposed)
      const { data, error } = await supabase
        .from('api_keys_metadata')
        .select('service')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error || !data) {
        console.warn('⚠️ No configured services found:', error);
        return [];
      }

      const services = data.map(row => row.service as ApiProvider);
      console.log(`✅ Found ${services.length} configured services:`, services);
      return services;
    } catch (error: any) {
      console.error('❌ Error getting configured services:', error);
      return [];
    }
  }

  /**
   * Retrieves API key from the legacy user_llm_keys table
   * Uses the correct schema: provider, api_key columns
   */
  private static async getLegacyApiKey(userId: string, service: ApiProvider): Promise<string | null> {
    try {
      console.log(`🔍 Checking legacy table for ${service} API key...`);

      const { data, error } = await supabase
        .from('user_llm_keys')
        .select('api_key')
        .eq('user_id', userId)
        .eq('provider', service)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.warn(`⚠️ Error querying legacy table for ${service}:`, error.message);
        return null;
      }

      if (!data?.api_key) {
        console.log(`ℹ️ No ${service} API key found in legacy table`);
        return null;
      }

      console.log(`✅ Found ${service} API key in legacy table`);
      return data.api_key;
    } catch (error: any) {
      console.error(`❌ Error retrieving legacy ${service} API key:`, error);
      return null;
    }
  }

  /**
   * Toggles the active status of an API key without deleting it
   * Also syncs with ai_service_providers table for AI providers
   */
  static async toggleApiKeyStatus(service: ApiProvider, isActive: boolean): Promise<boolean> {
    // Default models for each provider
    const DEFAULT_MODELS: Record<string, string> = {
      openrouter: 'openai/gpt-4o-mini',
      gemini: 'gemini-2.0-flash-exp',
      openai: 'gpt-4o-mini',
      anthropic: 'claude-3-5-sonnet-20241022',
      mistral: 'mistral-large-latest',
      lmstudio: 'local-model'
    };

    // Default priorities for providers
    const DEFAULT_PRIORITIES: Record<string, number> = {
      openrouter: 0,
      gemini: 1,
      openai: 2,
      anthropic: 3,
      mistral: 4,
      lmstudio: 5
    };

    try {
      console.log(`🔄 Toggling ${service} API key status to ${isActive ? 'active' : 'inactive'}...`);
      
      // Validate user authentication
      const { user, error: authError } = await ApiKeyService.validateUserAuth();
      if (authError) {
        toast.error(authError);
        return false;
      }

      // Check if API key exists (use metadata view for security - no encrypted_key exposed)
      const { data: apiKeyData } = await supabase
        .from('api_keys_metadata')
        .select('id')
        .eq('user_id', user.id)
        .eq('service', service)
        .maybeSingle();

      // If toggling ON, require API key to exist
      if (isActive && !apiKeyData) {
        console.error('❌ Cannot activate provider without API key:', service);
        toast.error(`No API key found for ${service}. Please add one first.`);
        return false;
      }

      // Update the api_keys table
      const { error: updateError } = await supabase
        .from('api_keys')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('service', service);

      if (updateError) {
        console.error(`❌ Error toggling ${service} API key status:`, updateError);
        toast.error(`Failed to ${isActive ? 'enable' : 'disable'} ${service} API key`);
        return false;
      }

      // Check if this is an AI provider
      const isAiProvider = DEFAULT_MODELS[service];
      
      // If NOT an AI provider (e.g., SERP, serpstack, etc.), we're done
      if (!isAiProvider) {
        console.log(`✅ ${service} (non-AI provider) status toggled successfully`);
        toast.success(`${service} ${isActive ? 'enabled' : 'disabled'}`);
        return true;
      }

      // Sync with ai_service_providers table for AI providers only
      if (isAiProvider) {
        console.log(`🔄 Syncing ${service} with ai_service_providers...`);

        // Check if provider record exists
        const { data: existingProvider } = await supabase
          .from('ai_service_providers')
          .select('id')
          .eq('user_id', user.id)
          .eq('provider', service)
          .maybeSingle();

        if (existingProvider) {
          // Update existing provider
          const updateData: any = {
            status: isActive ? 'active' : 'inactive',
            preferred_model: DEFAULT_MODELS[service],
            priority: DEFAULT_PRIORITIES[service] ?? 99,
            error_message: null,
            updated_at: new Date().toISOString()
          };
          
          // Sync DECRYPTED api_key field when activating (edge functions need plain text)
          // Use getApiKey which goes through the secure edge function
          if (isActive && apiKeyData) {
            try {
              const decryptedKey = await ApiKeyService.getApiKey(service);
              if (decryptedKey) {
                updateData.api_key = decryptedKey;
                console.log(`🔓 Decrypted ${service} API key for ai_service_providers sync`);
              }
            } catch (decryptError) {
              console.error(`❌ Failed to decrypt ${service} key for sync:`, decryptError);
              // Don't update api_key if decryption fails
            }
          }

          const { error: providerError } = await supabase
            .from('ai_service_providers')
            .update(updateData)
            .eq('user_id', user.id)
            .eq('provider', service);

          if (providerError) {
            console.error('❌ Error updating ai_service_providers:', providerError);
          } else {
            console.log(`✅ ${service} synced in ai_service_providers with plain text key`);
          }
        } else if (isActive && apiKeyData) {
          // Insert new provider record only if activating
          // Decrypt the key using secure edge function before storing
          let plainTextKey: string | null = null;
          try {
            plainTextKey = await ApiKeyService.getApiKey(service);
            if (!plainTextKey) {
              throw new Error('Failed to retrieve decrypted key');
            }
            console.log(`🔓 Decrypted ${service} API key for ai_service_providers insert`);
          } catch (decryptError) {
            console.error(`❌ Failed to decrypt ${service} key for insert:`, decryptError);
            toast.error(`Failed to configure ${service}. Please re-enter your API key.`);
            return false;
          }

          const { error: insertError } = await supabase
            .from('ai_service_providers')
            .insert({
              user_id: user.id,
              provider: service,
              status: 'active',
              priority: DEFAULT_PRIORITIES[service] ?? 99,
              preferred_model: DEFAULT_MODELS[service],
              api_key: plainTextKey,
              capabilities: ['chat', 'completion'],
              available_models: [DEFAULT_MODELS[service]]
            });

          if (insertError) {
            console.error('❌ Error inserting ai_service_providers:', insertError);
          } else {
            console.log(`✅ ${service} added to ai_service_providers`);
          }
        }
      }

      console.log(`✅ ${service} API key ${isActive ? 'enabled' : 'disabled'} successfully`);
      toast.success(`${service} API key ${isActive ? 'enabled' : 'disabled'}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Error in toggleApiKeyStatus for ${service}:`, error);
      toast.error(`Failed to update ${service} API key status: ${error.message}`);
      return false;
    }
  }

  /**
   * Migrates all user's API keys to new encryption format
   */
  static async migrateAllUserKeys(): Promise<void> {
    try {
      console.log('🔄 Starting migration of all user API keys...');
      
      // Validate user authentication - Fixed: Use ApiKeyService instead of this
      const { user, error: authError } = await ApiKeyService.validateUserAuth();
      if (authError) {
        toast.error(authError);
        return;
      }

      const services: ApiProvider[] = ['openai', 'anthropic', 'gemini', 'mistral', 'lmstudio', 'openrouter', 'serp', 'serpstack'];
      
      let migratedCount = 0;
      for (const service of services) {
        try {
          console.log(`🔄 Checking ${service} API key for migration...`);
          // Fixed: Use ApiKeyService instead of this
          const key = await ApiKeyService.getApiKey(service);
          if (key) {
            // Re-store the key to ensure it's using the new encryption
            // Fixed: Use ApiKeyService instead of this
            const success = await ApiKeyService.storeApiKey(service, key);
            if (success) {
              migratedCount++;
              console.log(`✅ ${service} API key migrated successfully`);
            }
          }
        } catch (error: any) {
          console.error(`❌ Failed to migrate ${service} API key:`, error);
        }
      }
      
      if (migratedCount > 0) {
        toast.success(`Successfully migrated ${migratedCount} API keys to new security format`);
      } else {
        toast.info('No API keys required migration');
      }
    } catch (error: any) {
      console.error('❌ Error migrating API keys:', error);
      toast.error('Failed to update API key security format');
    }
  }
}

// Export convenience functions with proper naming
export const saveApiKey = ApiKeyService.storeApiKey;
export const storeApiKey = ApiKeyService.storeApiKey;
export const getApiKey = ApiKeyService.getApiKey;
export const deleteApiKey = ApiKeyService.deleteApiKey;
export const toggleApiKeyStatus = ApiKeyService.toggleApiKeyStatus;
export const getConfiguredServices = ApiKeyService.getConfiguredServices;
export const migrateAllUserKeys = ApiKeyService.migrateAllUserKeys;

// Export validation and testing functions
export const detectApiKeyType = detectKeyType;
export const testApiKey = testKey;
export const validateApiKey = validateApiKeyFormat;

// Export the service class itself for advanced usage
export { ApiKeyService };
