
/**
 * Unified storage service for API credentials
 * Provides consistent methods for storing, retrieving, and managing API keys
 * across different storage mechanisms (localStorage, Supabase DB)
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  method: StorageMethod = 'localStorage'
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
      
      // Database implementation would go here
      // For now, just save to localStorage as fallback
      localStorage.setItem(`${service}_api_key`, key);
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
  method: StorageMethod = 'localStorage'
): Promise<string | null> {
  try {
    // Always check localStorage first for now
    return localStorage.getItem(`${service}_api_key`);
  } catch (error) {
    console.error(`Error fetching ${service} API key:`, error);
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
  method: StorageMethod = 'localStorage'
): Promise<boolean> {
  try {
    localStorage.removeItem(`${service}_api_key`);
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
