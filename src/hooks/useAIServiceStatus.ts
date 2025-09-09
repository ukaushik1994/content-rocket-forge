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

      // Get provider information with fresh data
      const providers = await AIServiceController.getActiveProviders();
      const activeProviders = providers.filter(p => p.status === 'active').length;

      console.log('🔄 AI Service Status Refreshed:', {
        enabled: isEnabled,
        total: providers.length,
        active: activeProviders,
        providers: providers.map(p => ({ name: p.provider, status: p.status }))
      });

      setStatus({
        isEnabled,
        hasProviders: providers.length > 0,
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