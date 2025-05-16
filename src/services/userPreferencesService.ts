
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AiProvider } from "@/services/aiService/types";

interface UserPreferences {
  defaultAiProvider?: AiProvider;
  enableAiFallback?: boolean;
  // We can add more user preferences here in the future
}

/**
 * Save user preferences to localStorage
 */
export async function saveUserPreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
  try {
    // Get existing preferences
    const existing = getUserPreferences();
    
    // Merge with new preferences
    const merged = { ...existing, ...preferences };
    
    // Save to localStorage
    localStorage.setItem('user_preferences', JSON.stringify(merged));
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return false;
  }
}

/**
 * Get user preferences from localStorage
 */
export function getUserPreferences(): UserPreferences {
  try {
    const preferences = localStorage.getItem('user_preferences');
    return preferences ? JSON.parse(preferences) : {};
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return {};
  }
}

/**
 * Get a specific user preference
 */
export function getUserPreference<K extends keyof UserPreferences>(key: K): UserPreferences[K] | undefined {
  const preferences = getUserPreferences();
  return preferences[key];
}

/**
 * Save a specific user preference
 */
export async function saveUserPreference<K extends keyof UserPreferences>(
  key: K, 
  value: UserPreferences[K]
): Promise<boolean> {
  return saveUserPreferences({ [key]: value } as Partial<UserPreferences>);
}
