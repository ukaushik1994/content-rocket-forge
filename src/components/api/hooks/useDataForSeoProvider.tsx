
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  saveApiKey, 
  getApiKey, 
  testApiKey, 
  deleteApiKey,
  encodeDataForSeoCredentials,
  decodeDataForSeoCredentials,
  isDataForSeoFormat
} from "@/services/apiKeyService";
import { ApiProviderConfig } from '@/components/settings/api/types';
import { DataForSeoCredentials } from '@/types/serp';
import { TestResponse } from '../ProviderTestPanel';

export const useDataForSeoProvider = (provider: ApiProviderConfig) => {
  const [credentials, setCredentials] = useState<DataForSeoCredentials>({
    login: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [encodedCredentials, setEncodedCredentials] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [keyExists, setKeyExists] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [testSuccessful, setTestSuccessful] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('credentials');

  // Encode credentials when login/password change
  useEffect(() => {
    if (credentials.login && credentials.password) {
      const encoded = encodeDataForSeoCredentials(credentials.login, credentials.password);
      setEncodedCredentials(encoded);
    } else {
      setEncodedCredentials('');
    }
  }, [credentials]);

  // Load existing credentials
  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!provider.serviceKey) {
          throw new Error('Service key is not defined for this provider');
        }
        
        const key = await getApiKey(provider.serviceKey);
        
        if (key) {
          setEncodedCredentials(key);
          setKeyExists(true);
          setIsActive(true);
          
          // Try to decode the credentials
          const decoded = decodeDataForSeoCredentials(key);
          if (decoded) {
            setCredentials({
              login: decoded.login,
              password: decoded.password
            });
          }
          
          // Try to test the key when loading
          try {
            const success = await testApiKey(provider.serviceKey, key);
            setTestSuccessful(success);
            if (!success) {
              console.warn(`${provider.name} API key test failed during initialization`);
            }
          } catch (testError) {
            console.error(`Error testing ${provider.name} API key:`, testError);
          }
        }
      } catch (error: any) {
        console.error(`Error fetching ${provider.name} API key:`, error);
        setError(error.message || `Failed to load ${provider.name} API key`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredentials();
  }, [provider]);

  // Determine the status for visual display
  const getStatus = () => {
    if (isLoading) return 'loading';
    if (error) return 'error';
    if (provider.required && !keyExists) return 'required';
    if (keyExists && testSuccessful) return 'connected';
    if (keyExists && !testSuccessful) return 'not-verified';
    return 'none';
  };

  // Save credentials
  const handleSaveCredentials = async () => {
    if (!credentials.login || !credentials.password) {
      toast.error('Please enter both login and password');
      return false;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      if (!provider.serviceKey) {
        throw new Error('Service key is not defined for this provider');
      }
      
      // Encode credentials
      const encoded = encodeDataForSeoCredentials(credentials.login, credentials.password);
      
      // Save encoded credentials
      const success = await saveApiKey(provider.serviceKey, encoded);
      
      if (success) {
        setKeyExists(true);
        setIsActive(true);
        setEncodedCredentials(encoded);
        toast.success(`${provider.name} credentials saved successfully`);
        
        // Test the credentials after saving
        try {
          const testSuccess = await testApiKey(provider.serviceKey, encoded);
          setTestSuccessful(testSuccess);
          
          if (!testSuccess) {
            setError(`${provider.name} credentials were saved but could not be verified.`);
          }
        } catch (testError: any) {
          console.error(`Error testing ${provider.name} credentials after save:`, testError);
          setError(testError.message || `Failed to verify ${provider.name} credentials after saving`);
        }
      }
      
      return success;
    } catch (error: any) {
      console.error(`Error saving ${provider.name} credentials:`, error);
      setError(error.message || `Failed to save ${provider.name} credentials`);
      toast.error(error.message || `Failed to save ${provider.name} credentials`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Test credentials
  const handleTestCredentials = async (): Promise<TestResponse> => {
    try {
      setIsTesting(true);
      setError(null);
      
      if (!provider.serviceKey) {
        throw new Error('Service key is not defined for this provider');
      }
      
      // Use the current encoded credentials for testing
      const success = await testApiKey(provider.serviceKey, encodedCredentials);
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

  // Delete credentials - Accept the key parameter but don't use it
  const handleDeleteCredentials = async (_key?: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      
      if (!provider.serviceKey) {
        throw new Error('Service key is not defined for this provider');
      }
      
      const success = await deleteApiKey(provider.serviceKey);
      
      if (success) {
        setCredentials({ login: '', password: '' });
        setEncodedCredentials('');
        setKeyExists(false);
        setIsActive(false);
        setTestSuccessful(false);
        toast.success(`${provider.name} credentials deleted successfully`);
      }
      
      return success;
    } catch (error: any) {
      console.error(`Error deleting ${provider.name} credentials:`, error);
      setError(error.message || `Failed to delete ${provider.name} credentials`);
      toast.error(error.message || `Failed to delete ${provider.name} credentials`);
      return false;
    } finally {
      setIsDeleting(false);
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

  // Save provider configuration
  const handleSaveConfig = async (providerId: string, config: Record<string, any>): Promise<boolean> => {
    // In a real app, this would save to a user preferences store
    console.log('Saving config for', providerId, config);
    return true;
  };

  return {
    credentials,
    setCredentials,
    showPassword,
    setShowPassword,
    encodedCredentials,
    isLoading,
    isSaving,
    isTesting,
    isDeleting,
    keyExists,
    isActive,
    setIsActive,
    testSuccessful,
    error,
    activeTab,
    setActiveTab,
    status: getStatus(),
    handleSaveCredentials,
    handleTestCredentials,
    handleDeleteCredentials,
    handleAdvancedTest,
    handleSaveConfig
  };
};
