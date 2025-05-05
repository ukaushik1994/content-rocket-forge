
// CRUD operations for API keys

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { encryptKey, decryptKey } from "./encryption";
import { ApiKeyType } from "./types";

/**
 * Save an API key in the database
 * @param service The service the API key is for
 * @param key The API key to save
 * @returns A promise that resolves to a boolean indicating success
 */
export async function saveApiKey(service: string, key: string): Promise<boolean> {
  try {
    if (!key.trim()) {
      throw new Error('API key cannot be empty');
    }
    
    // Get the current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to save API keys');
    }
    
    const userId = user.id;

    const { data: existingKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service', service)
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const encrypted_key = encryptKey(key);

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

    toast.success(`${service} API key saved successfully`);
    return true;
  } catch (error: any) {
    console.error('Error saving API key:', error);
    toast.error(error.message || `Error saving ${service} API key`);
    return false;
  }
}

/**
 * Get an API key from the database
 * @param service The service to get the API key for
 * @returns A promise that resolves to the API key or null
 */
export async function getApiKey(service: string): Promise<string | null> {
  try {
    // Get the current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to retrieve API keys');
    }
    
    const userId = user.id;

    const { data, error } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', service)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error(`Error fetching ${service} API key:`, error);
      return null;
    }
    
    return data ? decryptKey(data.encrypted_key) : null;
  } catch (error) {
    console.error(`Error fetching ${service} API key:`, error);
    return null;
  }
}

/**
 * Delete an API key from the database
 * @param service The service to delete the API key for
 * @returns A promise that resolves to a boolean indicating success
 */
export async function deleteApiKey(service: string): Promise<boolean> {
  try {
    // Get the current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to delete API keys');
    }
    
    const userId = user.id;

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('service', service)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
    
    toast.success(`${service} API key deleted successfully`);
    return true;
  } catch (error: any) {
    console.error('Error deleting API key:', error);
    toast.error(error.message || `Error deleting ${service} API key`);
    return false;
  }
}
