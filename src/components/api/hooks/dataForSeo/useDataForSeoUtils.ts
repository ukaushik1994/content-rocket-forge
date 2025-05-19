
/**
 * Hook for DataForSEO utility functions
 */
export const useDataForSeoUtils = (state: ReturnType<typeof import('./useDataForSeoState').useDataForSeoState>) => {
  // Determine the status for visual display
  const getStatus = () => {
    const { isLoading, error, keyExists, testSuccessful } = state;
    
    if (isLoading) return 'loading';
    if (error) return 'error';
    if (keyExists && testSuccessful) return 'connected';
    if (keyExists && !testSuccessful) return 'not-verified';
    return 'none';
  };

  // Function to check if we should use real data or return null
  const shouldUseRealData = () => {
    const { keyExists, testSuccessful } = state;
    return keyExists && testSuccessful;
  };

  return {
    getStatus,
    shouldUseRealData
  };
};
