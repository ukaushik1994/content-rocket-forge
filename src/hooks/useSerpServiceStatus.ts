import { useState, useEffect } from 'react';
import { getApiKey } from '@/services/apiKeyService';

interface SerpServiceStatus {
  isEnabled: boolean;
  hasProviders: boolean;
  activeProviders: number;
  totalProviders: number;
  isLoading: boolean;
}

/**
 * Custom hook to monitor SERP service status
 */
export function useSerpServiceStatus() {
  const [status, setStatus] = useState<SerpServiceStatus>({
    isEnabled: true,
    hasProviders: false,
    activeProviders: 0,
    totalProviders: 0,
    isLoading: true
  });

  const refreshStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true }));

      // Check if API keys exist for SERP providers
      const [serpKey, serpstackKey] = await Promise.all([
        getApiKey('serp').catch(() => null),
        getApiKey('serpstack').catch(() => null)
      ]);

      const activeProviders = [serpKey, serpstackKey].filter(key => key && key.length > 0).length;
      const totalProviders = 2; // serp and serpstack

      setStatus({
        isEnabled: true,
        hasProviders: activeProviders > 0,
        activeProviders,
        totalProviders,
        isLoading: false
      });
    } catch (error) {
      console.error('Error checking SERP service status:', error);
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