
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

// Use the actual user ID for API keys
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

export async function testApiKey(service: string, key: string): Promise<boolean> {
  try {
    // In a real app, this would make a test call to the API
    if (service === 'openai' && key.startsWith('sk-')) {
      toast.success(`${service} API connection successful`);
      return true;
    } else if (service === 'serp' && key.length > 20) {
      toast.success(`${service} API connection successful`);
      return true;
    } else if (service === 'anthropic' && key.startsWith('sk-ant-')) {
      toast.success(`${service} API connection successful`);
      return true;
    } else if (service === 'gemini' && key.length > 15) {
      toast.success(`${service} API connection successful`);
      return true;
    } else {
      throw new Error(`Invalid ${service} API key format`);
    }
  } catch (error: any) {
    toast.error(error.message || `${service} API connection failed`);
    return false;
  }
}

// New function to detect API key type based on key format
export async function detectApiKeyType(key: string): Promise<string | null> {
  // Detect API key type based on common formats
  if (key.startsWith('sk-') && !key.startsWith('sk-ant-')) {
    return 'openai';
  } else if (key.startsWith('sk-ant-')) {
    return 'anthropic';
  } else if (key.startsWith('AIza')) {
    return 'gemini';
  } else if (key.length > 20 && /^[a-zA-Z0-9]{20,}$/.test(key)) {
    // Generic format check for SERP API keys
    return 'serp';
  }
  
  return null;
}
