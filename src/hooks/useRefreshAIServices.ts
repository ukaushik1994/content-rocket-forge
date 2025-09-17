import { useCallback } from 'react';

/**
 * Hook to refresh AI service caches and force re-detection of API keys
 */
export function useRefreshAIServices() {
  const refreshAll = useCallback(async () => {
    try {
      console.log('🔄 Refreshing all AI services...');
      
      // Clear AIServiceController cache
      const { default: AIServiceController } = await import('@/services/aiService/AIServiceController');
      AIServiceController.clearCache();
      
      // Force a fresh check
      const providers = await AIServiceController.getActiveProviders();
      console.log('✅ AI services refreshed, found providers:', providers.map(p => p.provider));
      
      return providers.length > 0;
    } catch (error) {
      console.error('❌ Error refreshing AI services:', error);
      return false;
    }
  }, []);

  return { refreshAll };
}