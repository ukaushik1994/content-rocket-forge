
/**
 * Unified storage service for API credentials
 * Provides consistent methods for storing, retrieving, and managing API keys
 * across different storage mechanisms (localStorage, Supabase DB)
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { encryptKey, decryptKey } from "./encryption";
import { SerpProvider } from "@/contexts/content-builder/types/serp-types";

export type StorageMethod = 'localStorage' | 'database';

/**
 * Save an API key to storage
 * @param service The service identifier
 * @param key The API key to save
 * @param method The storage method to use
 * @returns A promise resolving to a boolean indicating success
 */
export async function saveApiKey(
  service: string, 
  key: string, 
  method: StorageMethod = 'database'
): Promise<boolean> {
  try {
    if (!key.trim()) {
      throw new Error('API key cannot be empty');
    }
    
    // Handle special case for DataForSEO which uses a key in a specific format
    if (service === 'dataforseo' && method === 'localStorage') {
      localStorage.setItem(`${service}_api_key`, key);
      return true;
    }
    
    if (method === 'localStorage') {
      localStorage.setItem(`${service}_api_key`, key);
      return true;
    } else if (method === 'database') {
      // Get the current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Fallback to localStorage if not authenticated
        localStorage.setItem(`${service}_api_key`, key);
        return true;
      }
      
      const userId = user.id;
      
      // Make sure the key is valid before saving
      if (key === 'SERP_API_KEY' || key === 'OPENAI_API_KEY') {
        throw new Error(`It looks like you're trying to save a placeholder value. Please enter a valid API key.`);
      }

      const { data: existingKey, error: fetchError } = await supabase
        .from('api_keys')
        .select('*')
        .eq('service', service)
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const encrypted_key = encryptKey(key);
      
      if (!encrypted_key) {
        throw new Error(`Failed to encrypt the ${service} API key`);
      }

      if (existingKey) {
        // Update existing key
        const { error } = await supabase
          .from('api_keys')
          .update({ 
            encrypted_key, 
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingKey.id);

        if (error) {
          console.error('Error updating API key:', error);
          throw error;
        }
      } else {
        // Insert new key
        const { error } = await supabase
          .from('api_keys')
          .insert({ 
            service, 
            encrypted_key, 
            is_active: true,
            user_id: userId
          });

        if (error) {
          console.error('Error inserting API key:', error);
          throw error;
        }
      }
      
      return true;
    }
    
    throw new Error(`Unsupported storage method: ${method}`);
  } catch (error: any) {
    console.error('Error saving API key:', error);
    toast.error(error.message || `Error saving ${service} API key`);
    return false;
  }
}

/**
 * Get an API key from storage
 * @param service The service to get the API key for
 * @param method Preferred storage method to check first
 * @returns A promise that resolves to the API key or null
 */
export async function getApiKey(
  service: string, 
  method: StorageMethod = 'database'
): Promise<string | null> {
  try {
    // Always check localStorage first for DataForSEO
    if (service === 'dataforseo') {
      const localKey = localStorage.getItem(`${service}_api_key`);
      if (localKey) return localKey;
    }
    
    // Check the preferred method first
    if (method === 'localStorage') {
      const localKey = localStorage.getItem(`${service}_api_key`);
      if (localKey) return localKey;
      
      // Fallback to database if not found in localStorage
      return await getDatabaseApiKey(service);
    } else {
      // Try database first
      const dbKey = await getDatabaseApiKey(service);
      if (dbKey) return dbKey;
      
      // Fallback to localStorage
      return localStorage.getItem(`${service}_api_key`);
    }
  } catch (error) {
    console.error(`Error fetching ${service} API key:`, error);
    // Fallback to localStorage if database fetch fails
    return localStorage.getItem(`${service}_api_key`);
  }
}

/**
 * Helper function to get an API key from the database
 */
async function getDatabaseApiKey(service: string): Promise<string | null> {
  try {
    // Get the current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    const userId = user.id;

    const { data, error } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', service)
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching ${service} API key:`, error);
      return null;
    }
    
    if (!data || !data.encrypted_key) {
      return null;
    }
    
    const decryptedKey = decryptKey(data.encrypted_key);
    
    if (!decryptedKey || decryptedKey === 'SERP_API_KEY' || decryptedKey === 'OPENAI_API_KEY') {
      console.error(`Invalid ${service} API key retrieved from database`);
      return null;
    }
    
    return decryptedKey;
  } catch (error) {
    console.error(`Error fetching ${service} API key from database:`, error);
    return null;
  }
}

/**
 * Delete an API key from storage
 * @param service The service to delete the API key for
 * @param method The storage method to use
 * @returns A promise that resolves to a boolean indicating success
 */
export async function deleteApiKey(
  service: string,
  method: StorageMethod = 'database'
): Promise<boolean> {
  try {
    if (method === 'localStorage' || service === 'dataforseo') {
      localStorage.removeItem(`${service}_api_key`);
    }
    
    if (method === 'database') {
      // Get the current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return true; // If not authenticated, we've already removed from localStorage
      }
      
      const userId = user.id;

      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('service', service)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting API key from database:', error);
        throw error;
      }
    }
    
    return true;
  } catch (error: any) {
    console.error('Error deleting API key:', error);
    toast.error(error.message || `Error deleting ${service} API key`);
    return false;
  }
}

/**
 * Check if an API key exists for a particular service
 * @param service The service to check for
 * @returns A promise that resolves to a boolean indicating if the key exists
 */
export async function hasApiKey(service: string): Promise<boolean> {
  const key = await getApiKey(service);
  return key !== null && key !== '';
}

/**
 * Gets the preferred storage method based on authentication state
 * @returns The preferred storage method
 */
export async function getPreferredStorageMethod(): Promise<StorageMethod> {
  const { data: { user } } = await supabase.auth.getUser();
  return user ? 'database' : 'localStorage';
}
