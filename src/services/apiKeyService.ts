
import { supabase } from '@/integrations/supabase/client';
import { encryptApiKey, decryptApiKey, migrateApiKey } from './apiKeys/encryption';
import { toast } from 'sonner';

type ApiService = 'openai' | 'anthropic' | 'gemini' | 'serpapi';

/**
 * Secure API key management service with proper encryption
 */
class ApiKeyService {
  /**
   * Stores an encrypted API key for a service
   */
  static async storeApiKey(service: ApiService, apiKey: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to store API keys');
        return false;
      }

      // Validate API key format
      if (!this.validateApiKey(service, apiKey)) {
        toast.error('Invalid API key format for ' + service);
        return false;
      }

      // Encrypt the API key using the new secure encryption
      const encryptedKey = await encryptApiKey(apiKey, user.id);

      // Store in database
      const { error } = await supabase
        .from('api_keys')
        .upsert({
          user_id: user.id,
          service,
          encrypted_key: encryptedKey,
          is_active: true,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing API key:', error);
        toast.error('Failed to store API key');
        return false;
      }

      toast.success(`${service} API key stored securely`);
      return true;
    } catch (error: any) {
      console.error('Error in storeApiKey:', error);
      toast.error('Failed to store API key: ' + error.message);
      return false;
    }
  }

  /**
   * Retrieves and decrypts an API key for a service
   */
  static async getApiKey(service: ApiService): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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
        return null;
      }

      // Try to decrypt with new encryption method
      try {
        return await decryptApiKey(data.encrypted_key, user.id);
      } catch (decryptError) {
        // If decryption fails, it might be an old format
        console.warn(`API key for ${service} uses old encryption format`);
        try {
          // Try to migrate the key
          const migratedKey = await migrateApiKey(data.encrypted_key, user.id);
          return migratedKey;
        } catch (migrationError) {
          console.error(`Failed to migrate API key for ${service}:`, migrationError);
          toast.error(`API key for ${service} needs to be re-entered due to security upgrade`);
          return null;
        }
      }
    } catch (error: any) {
      console.error('Error retrieving API key:', error);
      return null;
    }
  }

  /**
   * Deletes an API key for a service
   */
  static async deleteApiKey(service: ApiService): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to delete API keys');
        return false;
      }

      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('user_id', user.id)
        .eq('service', service);

      if (error) {
        console.error('Error deleting API key:', error);
        toast.error('Failed to delete API key');
        return false;
      }

      toast.success(`${service} API key deleted`);
      return true;
    } catch (error: any) {
      console.error('Error in deleteApiKey:', error);
      toast.error('Failed to delete API key: ' + error.message);
      return false;
    }
  }

  /**
   * Lists all configured API services for the user
   */
  static async getConfiguredServices(): Promise<ApiService[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('api_keys')
        .select('service')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error || !data) {
        return [];
      }

      return data.map(row => row.service as ApiService);
    } catch (error: any) {
      console.error('Error getting configured services:', error);
      return [];
    }
  }

  /**
   * Validates API key format for different services
   */
  private static validateApiKey(service: ApiService, apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return false;
    }

    const trimmedKey = apiKey.trim();

    switch (service) {
      case 'openai':
        return trimmedKey.startsWith('sk-') && trimmedKey.length > 20;
      case 'anthropic':
        return trimmedKey.startsWith('sk-ant-') && trimmedKey.length > 20;
      case 'gemini':
        return trimmedKey.length > 20; // Google API keys vary in format
      case 'serpapi':
        return trimmedKey.length > 10; // SERP API keys vary in format
      default:
        return trimmedKey.length > 10; // Generic validation
    }
  }

  /**
   * Migrates all user's API keys to new encryption format
   */
  static async migrateAllUserKeys(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const services: ApiService[] = ['openai', 'anthropic', 'gemini', 'serpapi'];
      
      for (const service of services) {
        const key = await this.getApiKey(service);
        if (key) {
          // Re-store the key to ensure it's using the new encryption
          await this.storeApiKey(service, key);
        }
      }
      
      toast.success('API keys successfully updated to new security format');
    } catch (error: any) {
      console.error('Error migrating API keys:', error);
      toast.error('Failed to update API key security format');
    }
  }
}

// Export convenience functions
export const storeApiKey = ApiKeyService.storeApiKey;
export const getApiKey = ApiKeyService.getApiKey;
export const deleteApiKey = ApiKeyService.deleteApiKey;
export const getConfiguredServices = ApiKeyService.getConfiguredServices;
export const migrateAllUserKeys = ApiKeyService.migrateAllUserKeys;
