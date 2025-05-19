
import { ApiProviderConfig } from '@/components/settings/api/types';
import { useDataForSeoState } from './dataForSeo/useDataForSeoState';
import { useDataForSeoCredentials } from './dataForSeo/useDataForSeoCredentials';
import { useDataForSeoTesting } from './dataForSeo/useDataForSeoTesting';
import { useDataForSeoConfig } from './dataForSeo/useDataForSeoConfig';
import { useDataForSeoUtils } from './dataForSeo/useDataForSeoUtils';

/**
 * Main hook for DataForSEO provider management
 */
export const useDataForSeoProvider = (provider: ApiProviderConfig) => {
  // Initialize state
  const state = useDataForSeoState(provider.serviceKey);
  
  // Initialize credentials management
  const { handleSaveCredentials, handleDeleteCredentials } = useDataForSeoCredentials({ 
    provider, 
    state 
  });
  
  // Initialize testing functionality
  const { handleTestCredentials, handleAdvancedTest } = useDataForSeoTesting({ 
    provider, 
    state 
  });
  
  // Initialize configuration management
  const { handleSaveConfig } = useDataForSeoConfig();
  
  // Initialize utilities
  const { getStatus } = useDataForSeoUtils(state);

  return {
    ...state,
    status: getStatus(),
    handleSaveCredentials,
    handleTestCredentials,
    handleDeleteCredentials,
    handleAdvancedTest,
    handleSaveConfig
  };
};
