import { supabase } from '@/integrations/supabase/client';

/**
 * Fix AI providers with empty model arrays
 * This utility ensures all active providers have valid models configured
 */
export async function fixEmptyProviderModels() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get all active providers with empty models
    const { data: emptyProviders, error: fetchError } = await supabase
      .from('ai_service_providers')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (fetchError) throw fetchError;

    const fixes = [];

    for (const provider of emptyProviders || []) {
      // Check if available_models is empty
      const models = Array.isArray(provider.available_models) ? provider.available_models : [];
      
      if (models.length === 0) {
        let updatedModels: string[] = [];
        let preferredModel: string | null = null;

        // Set default models based on provider
        switch (provider.provider) {
          case 'openrouter':
            updatedModels = [
              'openai/gpt-4o-mini',
              'google/gemini-2.0-flash-exp',
              'anthropic/claude-3.5-sonnet'
            ];
            preferredModel = 'openai/gpt-4o-mini';
            break;
          case 'openai':
            updatedModels = [
              'gpt-5-2025-08-07',
              'gpt-5-mini-2025-08-07',
              'gpt-4.1-2025-04-14'
            ];
            preferredModel = 'gpt-4o-mini';
            break;
          case 'gemini':
            updatedModels = [
              'gemini-2.0-flash-exp',
              'gemini-1.5-pro',
              'gemini-1.5-flash'
            ];
            preferredModel = 'gemini-2.0-flash-exp';
            break;
          case 'anthropic':
            updatedModels = [
              'claude-3-5-sonnet-20241022',
              'claude-3-5-haiku-20241022'
            ];
            preferredModel = 'claude-3-5-sonnet-20241022';
            break;
          case 'mistral':
            updatedModels = [
              'mistral-large-latest',
              'mistral-medium-latest'
            ];
            preferredModel = 'mistral-large-latest';
            break;
          case 'lmstudio':
            updatedModels = ['local-model'];
            preferredModel = 'local-model';
            break;
        }

        if (updatedModels.length > 0) {
          const { error: updateError } = await supabase
            .from('ai_service_providers')
            .update({
              available_models: updatedModels,
              preferred_model: preferredModel,
              updated_at: new Date().toISOString()
            })
            .eq('id', provider.id);

          if (updateError) throw updateError;

          fixes.push({
            provider: provider.provider,
            modelsAdded: updatedModels.length,
            preferredModel
          });
        }
      }
    }

    return {
      success: true,
      fixes,
      message: fixes.length > 0 
        ? `Fixed ${fixes.length} providers with empty models`
        : 'All providers already configured correctly'
    };
  } catch (error) {
    console.error('Error fixing AI providers:', error);
    throw error;
  }
}

/**
 * Validate all AI providers have required configuration
 */
export async function validateAiProviders(): Promise<{
  valid: boolean;
  issues: string[];
  providers: any[];
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { valid: false, issues: ['User not authenticated'], providers: [] };
    }

    const { data: providers, error } = await supabase
      .from('ai_service_providers')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('priority', { ascending: true });

    if (error) throw error;

    const issues: string[] = [];
    
    for (const provider of providers || []) {
      const models = Array.isArray(provider.available_models) ? provider.available_models : [];
      
      if (!provider.api_key) {
        issues.push(`${provider.provider}: Missing API key`);
      }
      
      if (models.length === 0) {
        issues.push(`${provider.provider}: No models configured`);
      }
      
      if (!provider.preferred_model && models.length > 0) {
        issues.push(`${provider.provider}: No preferred model set`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      providers: providers || []
    };
  } catch (error) {
    console.error('Error validating AI providers:', error);
    throw error;
  }
}
