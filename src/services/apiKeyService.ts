
import { supabase } from '@/integrations/supabase/client';
import { encryptApiKey, decryptApiKey, migrateApiKey } from './apiKeys/encryption';
import { detectApiKeyType as detectKeyType, validateApiKeyFormat } from './apiKeys/validation';
import { testApiKey as testKey } from './apiKeys/testing';
import { toast } from 'sonner';

// Updated type to include all API providers
export type ApiProvider = 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'lmstudio' | 'serp' | 'serpstack';

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
      console.log(`💾 Starting API key storage for ${service}...`);
      
      // Validate inputs
      if (!service || typeof service !== 'string') {
        toast.error('Invalid service specified');
        return false;
      }
      
      if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
        toast.error('Invalid API key provided');
        return false;
      }

      // Validate user authentication
      const { user, error: authError } = await this.validateUserAuth();
      if (authError) {
        toast.error(authError);
        return false;
      }

      // Validate API key format using the imported function
      console.log(`🔍 Validating ${service} API key format...`);
      if (!validateApiKeyFormat(service, apiKey.trim())) {
        toast.error(`Invalid API key format for ${service}`);
        return false;
      }
      console.log(`✅ ${service} API key format validation passed`);

      // Encrypt the API key using the new secure encryption
      console.log(`🔐 Encrypting ${service} API key...`);
      const encryptedKey = await encryptApiKey(apiKey.trim(), user.id);
      console.log(`✅ ${service} API key encrypted successfully`);

      // Store in database with retry logic
      console.log(`💾 Storing encrypted ${service} API key in database...`);
      const { error: dbError } = await supabase
        .from('api_keys')
        .upsert({
          user_id: user.id,
          service,
          encrypted_key: encryptedKey,
          is_active: true,
          updated_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('❌ Database storage error:', dbError);
        toast.error('Failed to store API key in database');
        return false;
      }

      console.log(`✅ ${service} API key stored successfully`);
      toast.success(`${service} API key stored securely`);
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
      console.log(`🔍 Retrieving ${service} API key...`);
      
      // Validate user authentication
      const { user, error: authError } = await this.validateUserAuth();
      if (authError) {
        console.warn(`⚠️ Auth error when retrieving ${service} API key:`, authError);
        return null;
      }

      const { data, error } = await supabase
        .from('api_keys')
        .select('encrypted_key')
        .eq('user_id', user.id)
        .eq('service', service)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.log(`ℹ️ No ${service} API key found in database`);
        return null;
      }

      // Try to decrypt with new encryption method
      try {
        console.log(`🔓 Decrypting ${service} API key...`);
        const decryptedKey = await decryptApiKey(data.encrypted_key, user.id);
        console.log(`✅ ${service} API key decrypted successfully`);
        return decryptedKey;
      } catch (decryptError: any) {
        // If decryption fails, it might be an old format
        console.warn(`⚠️ ${service} API key decryption failed, attempting migration:`, decryptError.message);
        try {
          // Try to migrate the key
          const migratedKey = await migrateApiKey(data.encrypted_key, user.id);
          console.log(`✅ ${service} API key migrated successfully`);
          return migratedKey;
        } catch (migrationError: any) {
          console.error(`❌ Failed to migrate ${service} API key:`, migrationError);
          toast.error(`${service} API key needs to be re-entered due to security upgrade`);
          return null;
        }
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
      
      // Validate user authentication
      const { user, error: authError } = await this.validateUserAuth();
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
      
      // Validate user authentication
      const { user, error: authError } = await this.validateUserAuth();
      if (authError) {
        console.warn('⚠️ Auth error when retrieving configured services:', authError);
        return [];
      }

      const { data, error } = await supabase
        .from('api_keys')
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
   * Migrates all user's API keys to new encryption format
   */
  static async migrateAllUserKeys(): Promise<void> {
    try {
      console.log('🔄 Starting migration of all user API keys...');
      
      // Validate user authentication
      const { user, error: authError } = await this.validateUserAuth();
      if (authError) {
        toast.error(authError);
        return;
      }

      const services: ApiProvider[] = ['openai', 'anthropic', 'gemini', 'mistral', 'lmstudio', 'serp', 'serpstack'];
      
      let migratedCount = 0;
      for (const service of services) {
        try {
          console.log(`🔄 Checking ${service} API key for migration...`);
          const key = await this.getApiKey(service);
          if (key) {
            // Re-store the key to ensure it's using the new encryption
            const success = await this.storeApiKey(service, key);
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
export const getConfiguredServices = ApiKeyService.getConfiguredServices;
export const migrateAllUserKeys = ApiKeyService.migrateAllUserKeys;

// Export validation and testing functions
export const detectApiKeyType = detectKeyType;
export const testApiKey = testKey;
export const validateApiKey = validateApiKeyFormat;

// Export the service class itself for advanced usage
export { ApiKeyService };
