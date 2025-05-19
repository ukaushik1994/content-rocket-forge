
import { useEffect } from 'react';
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
import { DataForSeoCredentials } from '@/types/serp';
import { ApiProviderConfig } from '@/components/settings/api/types';
import { TestResponse } from '../../ProviderTestPanel';

export interface UseDataForSeoCredentialsParams {
  provider: ApiProviderConfig;
  state: ReturnType<typeof import('./useDataForSeoState').useDataForSeoState>;
}

export const useDataForSeoCredentials = ({ provider, state }: UseDataForSeoCredentialsParams) => {
  const {
    credentials,
    setCredentials,
    setEncodedCredentials,
    setIsLoading,
    setIsSaving,
    setIsTesting,
    setIsDeleting,
    setKeyExists,
    setIsActive,
    setTestSuccessful,
    setError,
    encodedCredentials
  } = state;

  // Encode credentials when login/password change
  useEffect(() => {
    if (credentials.login && credentials.password) {
      const encoded = encodeDataForSeoCredentials(credentials.login, credentials.password);
      setEncodedCredentials(encoded);
    } else {
      setEncodedCredentials('');
    }
  }, [credentials, setEncodedCredentials]);

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
  }, [provider, setCredentials, setEncodedCredentials, setError, setIsActive, setIsLoading, setKeyExists, setTestSuccessful]);

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

  // Delete credentials
  const handleDeleteCredentials = async (key?: string): Promise<boolean> => {
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

  return {
    handleSaveCredentials,
    handleDeleteCredentials
  };
};
