
/**
 * Unified storage service for API credentials
 * Provides consistent methods for storing, retrieving, and managing API keys
 * across different storage mechanisms (localStorage, Supabase DB)
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { encryptKey, decryptKey } from "./encryption";

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
        toast.warning("You're not logged in - API key saved to local storage only");
        return true;
      }
      
      const encrypted_key = encryptKey(key);
      if (!encrypted_key) {
        throw new Error('Failed to encrypt API key');
      }
      
      // Check if this service already has a key for this user
      const { data: existingKey, error: fetchError } = await supabase
        .from('api_keys')
        .select('*')
        .eq('service', service)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (fetchError) {
        console.error('Error checking for existing API key:', fetchError);
        throw new Error('Failed to check for existing API key');
      }
      
      let result;
      
      // Update or insert the key
      if (existingKey) {
        result = await supabase
          .from('api_keys')
          .update({ 
            encrypted_key, 
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingKey.id);
      } else {
        result = await supabase
          .from('api_keys')
          .insert({ 
            service, 
            encrypted_key, 
            is_active: true,
            user_id: user.id
          });
      }
      
      if (result.error) {
        console.error('Error saving API key to database:', result.error);
        throw new Error('Failed to save API key to database');
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
    // Try to get from localStorage first (for backward compatibility)
    const localKey = localStorage.getItem(`${service}_api_key`);
    
    // If we're explicitly looking for localStorage or not authenticated, return the local key
    if (method === 'localStorage') {
      return localKey;
    }
    
    // Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Not authenticated, use localStorage
      return localKey;
    }
    
    // Try to get from database
    const { data, error } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', service)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();
      
    if (error) {
      console.error('Error getting API key from database:', error);
      // Fall back to localStorage in case of error
      return localKey;
    }
    
    if (data?.encrypted_key) {
      const decrypted = decryptKey(data.encrypted_key);
      return decrypted;
    }
    
    // If no key in database, fall back to localStorage
    return localKey;
  } catch (error) {
    console.error(`Error fetching ${service} API key:`, error);
    // Attempt to fall back to localStorage in case of error
    return localStorage.getItem(`${service}_api_key`);
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
    // Always remove from localStorage for cleanup
    localStorage.removeItem(`${service}_api_key`);
    
    if (method === 'localStorage') {
      return true;
    }
    
    // Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Not authenticated, just removed from localStorage
      return true;
    }
    
    // Delete from database
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('service', service)
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error deleting API key from database:', error);
      throw new Error('Failed to delete API key from database');
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
