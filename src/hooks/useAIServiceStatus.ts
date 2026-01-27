import { useState, useEffect } from 'react';
import { getUserPreference } from '@/services/userPreferencesService';
import { supabase } from '@/integrations/supabase/client';

interface AIServiceStatus {
  isEnabled: boolean;
  hasProviders: boolean;
  activeProviders: number;
  totalProviders: number;
  isLoading: boolean;
}

/**
 * Custom hook to monitor AI service status
 * Uses row-existence check (not decryption) for reliable status
 */
export function useAIServiceStatus() {
  const [status, setStatus] = useState<AIServiceStatus>({
    isEnabled: true,
    hasProviders: false,
    activeProviders: 0,
    totalProviders: 0,
    isLoading: true
  });

  const refreshStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true }));
      console.log('🔄 Starting AI service status refresh...');

      // Check if service is enabled
      const isEnabled = getUserPreference('enableAiService') !== false;
      console.log('📋 Service enabled by user preference:', isEnabled);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('ℹ️ No authenticated user');
        setStatus({
          isEnabled,
          hasProviders: false,
          activeProviders: 0,
          totalProviders: 6,
          isLoading: false
        });
        return;
      }

      // Check for configured API keys by existence (no decryption needed)
      const providers = ['openrouter', 'anthropic', 'openai', 'gemini', 'mistral', 'lmstudio'] as const;
      
      // Use the secure metadata view (no encrypted_key exposed)
      const { data: configuredKeys, error } = await supabase
        .from('api_keys_metadata')
        .select('service')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .in('service', providers);

      if (error) {
        console.error('❌ Error checking API keys:', error);
        setStatus(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const activeProviders = configuredKeys?.length || 0;
      const configuredServices = configuredKeys?.map(k => k.service) || [];
      
      console.log('📊 AI Service Status:', {
        enabled: isEnabled,
        total: providers.length,
        active: activeProviders,
        configured: configuredServices
      });

      setStatus({
        isEnabled,
        hasProviders: activeProviders > 0,
        activeProviders,
        totalProviders: providers.length,
        isLoading: false
      });
    } catch (error) {
      console.error('❌ Error checking AI service status:', error);
      setStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  return {
    ...status,
    refreshStatus
  };
}