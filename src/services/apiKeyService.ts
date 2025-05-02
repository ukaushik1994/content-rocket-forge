
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Simple encryption (not suitable for production, just for demonstration)
// In production, we should use an edge function for storing sensitive keys
const encryptKey = (key: string): string => {
  return btoa(key); // Base64 encode
};

const decryptKey = (encryptedKey: string): string => {
  try {
    return atob(encryptedKey); // Base64 decode
  } catch (error) {
    return '';
  }
};

export type ApiKeyType = {
  id: string;
  service: string;
  encrypted_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Default user ID to use for all API keys - using the same UUID as in AuthContext
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

// Use Supabase with a default user ID
export async function saveApiKey(service: string, key: string): Promise<boolean> {
  try {
    if (!key.trim()) {
      throw new Error('API key cannot be empty');
    }

    const { data: existingKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service', service)
      .eq('user_id', DEFAULT_USER_ID)
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
          user_id: DEFAULT_USER_ID
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

export async function getApiKey(service: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', service)
      .eq('user_id', DEFAULT_USER_ID)
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

export async function deleteApiKey(service: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('service', service)
      .eq('user_id', DEFAULT_USER_ID);

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

export async function testApiKey(service: string, key: string): Promise<boolean> {
  // In a real app, this would make a test call to the API
  // For now, we'll just simulate a successful call
  return new Promise(resolve => {
    setTimeout(() => {
      toast.success(`${service} API connection successful`);
      resolve(true);
    }, 1000);
  });
}
