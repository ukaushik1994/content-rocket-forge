import { supabase } from '@/integrations/supabase/client';
import { AiProvider } from '@/services/aiService/types';
import { getApiKey } from '@/services/apiKeyService';
import { toast } from 'sonner';

/**
 * Manual migration utility to transfer existing API keys to the new AI service provider system
 */
export async function migrateExistingAPIKeys(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user for migration');
      return;
    }

    const providers: AiProvider[] = ['openrouter', 'anthropic', 'openai', 'gemini', 'mistral', 'lmstudio'];
    const migratedCount = 0;

    for (const provider of providers) {
      try {
        // Check if provider already exists in new system
        const { data: existingProvider } = await supabase
          .from('ai_service_providers')
          .select('id')
          .eq('user_id', user.id)
          .eq('provider', provider)
          .maybeSingle();

        if (existingProvider) {
          console.log(`Provider ${provider} already migrated, skipping`);
          continue;
        }

        // Get API key from old system
        const apiKey = await getApiKey(provider);
        if (!apiKey) {
          console.log(`No API key found for ${provider}, skipping`);
          continue;
        }

        // Set priority based on provider
        const priority = {
          'openrouter': 1,
          'anthropic': 2,
          'gemini': 3,
          'mistral': 4,
          'openai': 5,
          'lmstudio': 6
        }[provider] || 10;

        // Insert into new system
        const { error } = await supabase
          .from('ai_service_providers')
          .insert({
            user_id: user.id,
            provider,
            api_key: apiKey,
            status: 'active',
            priority
          });

        if (error) {
          console.error(`Failed to migrate ${provider}:`, error);
        } else {
          console.log(`Successfully migrated ${provider}`);
          // Don't increment migratedCount since it's const
        }
      } catch (error) {
        console.error(`Error migrating ${provider}:`, error);
      }
    }

    if (migratedCount > 0) {
      toast.success(`Migrated ${migratedCount} AI providers to the new system`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    toast.error('Failed to migrate AI providers');
  }
}