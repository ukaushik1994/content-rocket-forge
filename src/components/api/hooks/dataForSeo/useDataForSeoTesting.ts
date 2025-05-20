
import { testApiKey, isDataForSeoFormat } from "@/services/apiKeyService";
import { ApiProviderConfig } from '@/components/settings/api/types';
import { TestResponse } from '../../ProviderTestPanel';
import { toast } from "sonner";

export interface UseDataForSeoTestingParams {
  provider: ApiProviderConfig;
  state: ReturnType<typeof import('./useDataForSeoState').useDataForSeoState>;
}

export const useDataForSeoTesting = ({ provider, state }: UseDataForSeoTestingParams) => {
  const {
    setError,
    setIsTesting,
    setTestSuccessful,
    encodedCredentials
  } = state;

  // Test credentials
  const handleTestCredentials = async (): Promise<TestResponse> => {
    try {
      setIsTesting(true);
      setError(null);
      
      if (!provider.serviceKey) {
        throw new Error('Service key is not defined for this provider');
      }
      
      // Use the current encoded credentials for testing
      const success = await import("@/services/apiKeyService").then(
        module => module.testApiKey(provider.serviceKey, encodedCredentials)
      );
      
      setTestSuccessful(success);
      
      if (success) {
        toast.success(`${provider.name} credentials verified successfully`);
      } else {
        setError(`${provider.name} credentials could not be verified.`);
        toast.error(`${provider.name} credentials could not be verified`);
      }

      return { 
        success, 
        data: success ? { message: 'Connection successful' } : undefined,
        error: success ? undefined : 'Authentication failed',
        responseTime: Math.floor(Math.random() * 200) + 100, // Simulate response time
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error(`Error testing ${provider.name} credentials:`, error);
      setError(error.message || `Failed to test ${provider.name} credentials`);
      setTestSuccessful(false);
      toast.error(error.message || `Failed to test ${provider.name} credentials`);
      
      return {
        success: false,
        error: error.message || `Failed to test ${provider.name} credentials`,
        timestamp: new Date()
      };
    } finally {
      setIsTesting(false);
    }
  };

  // Run advanced test with options
  const handleAdvancedTest = async (key: string, options?: any): Promise<TestResponse> => {
    try {
      setIsTesting(true);
      
      // In a real app, this would make an actual API call to DataForSEO
      // with the specified options
      console.log('Testing with options:', options);
      
      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const success = isDataForSeoFormat(key);
      
      // Simulate data based on the test
      let responseData = null;
      if (success && options?.query) {
        responseData = {
          task_id: Math.floor(Math.random() * 1000000),
          status_code: 20000,
          status_message: "Ok",
          tasks: [
            {
              id: Math.floor(Math.random() * 1000000),
              status_code: 20000,
              status_message: "Task Created",
              time: new Date().toISOString(),
              results: {
                organic_results: [
                  { position: 1, title: `Result for ${options.query}`, url: "https://example.com/1" },
                  { position: 2, title: `Another result for ${options.query}`, url: "https://example.com/2" }
                ],
                items_count: 2
              }
            }
          ]
        };
      }
      
      return {
        success: success,
        data: responseData,
        error: success ? undefined : 'Authentication failed or invalid request',
        responseTime: Math.floor(Math.random() * 500) + 300,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
        timestamp: new Date()
      };
    } finally {
      setIsTesting(false);
    }
  };

  return {
    handleTestCredentials,
    handleAdvancedTest
  };
};
