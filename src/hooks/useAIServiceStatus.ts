import { useState, useEffect } from 'react';
import { getUserPreference } from '@/services/userPreferencesService';
import AIServiceController from '@/services/aiService/AIServiceController';

interface AIServiceStatus {
  isEnabled: boolean;
  hasProviders: boolean;
  activeProviders: number;
  totalProviders: number;
  isLoading: boolean;
}

/**
 * Custom hook to monitor AI service status
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

      // Check if service is enabled
      const isEnabled = getUserPreference('enableAiService') !== false;

      // Check if we have any API keys configured using the unified service
      const { getApiKey } = await import('@/services/apiKeys/crud');
      const providers = ['openrouter', 'anthropic', 'openai', 'gemini', 'mistral'] as const;
      
      let activeProviders = 0;
      const providerStatus: Array<{name: string, status: string}> = [];
      
      for (const provider of providers) {
        try {
          const key = await getApiKey(provider);
          if (key && key.length > 0) {
            activeProviders++;
            providerStatus.push({ name: provider, status: 'active' });
          } else {
            providerStatus.push({ name: provider, status: 'inactive' });
          }
        } catch (error) {
          providerStatus.push({ name: provider, status: 'error' });
        }
      }

      console.log('🔄 AI Service Status Refreshed:', {
        enabled: isEnabled,
        total: providers.length,
        active: activeProviders,
        providers: providerStatus
      });

      setStatus({
        isEnabled,
        hasProviders: activeProviders > 0,
        activeProviders,
        totalProviders: providers.length,
        isLoading: false
      });
    } catch (error) {
      console.error('Error checking AI service status:', error);
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