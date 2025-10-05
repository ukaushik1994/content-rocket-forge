import { useState, useEffect } from 'react';
import { getUserPreference } from '@/services/userPreferencesService';

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
      console.log('🔄 Starting AI service status refresh...');

      // Check if service is enabled
      const isEnabled = getUserPreference('enableAiService') !== false;
      console.log('📋 Service enabled by user preference:', isEnabled);

      // Check if we have any API keys configured using the unified service
      const { getApiKey } = await import('@/services/apiKeys/crud');
      const providers = ['openrouter', 'anthropic', 'openai', 'gemini', 'mistral', 'lmstudio'] as const;
      
      let activeProviders = 0;
      const providerStatus: Array<{name: string, status: string}> = [];
      
      console.log('🔍 Checking providers:', providers);
      
      for (const provider of providers) {
        try {
          console.log(`🔑 Checking API key for ${provider}...`);
          const key = await getApiKey(provider);
          console.log(`🔑 ${provider} key result:`, key ? `Found (${key.length} chars)` : 'Not found');
          
          if (key && key.trim().length > 0) {
            activeProviders++;
            providerStatus.push({ name: provider, status: 'active' });
            console.log(`✅ ${provider} is ACTIVE`);
          } else {
            providerStatus.push({ name: provider, status: 'inactive' });
            console.log(`❌ ${provider} is INACTIVE (no key)`);
          }
        } catch (error) {
          console.error(`❌ ${provider} ERROR:`, error);
          providerStatus.push({ name: provider, status: 'error' });
        }
      }

      // Double-check with AIServiceController
      let controllerActiveCount = 0;
      try {
        const { default: AIServiceController } = await import('@/services/aiService/AIServiceController');
        const controllerProviders = await AIServiceController.getActiveProviders();
        controllerActiveCount = controllerProviders.length;
        console.log('🎮 AIServiceController found providers:', controllerProviders.map(p => p.provider));
      } catch (controllerError) {
        console.error('❌ Error checking AIServiceController:', controllerError);
      }

      console.log('📊 Final AI Service Status:', {
        enabled: isEnabled,
        total: providers.length,
        activeByHook: activeProviders,
        activeByController: controllerActiveCount,
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