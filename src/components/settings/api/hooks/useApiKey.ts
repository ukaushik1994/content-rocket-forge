
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  saveApiKey, 
  getApiKey, 
  testApiKey, 
  deleteApiKey,
  detectApiKeyType 
} from "@/services/apiKeyService";
import { ApiProvider } from '../types';

export const useApiKey = (provider: ApiProvider) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [keyExists, setKeyExists] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [testSuccessful, setTestSuccessful] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const key = await getApiKey(provider.serviceKey);
        
        if (key) {
          setApiKey(key);
          setKeyExists(true);
          setIsActive(true);
          
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

    fetchApiKey();
  }, [provider]);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const success = await saveApiKey(provider.serviceKey, apiKey);
      
      if (success) {
        setKeyExists(true);
        setIsActive(true);
        toast.success(`${provider.name} API key saved successfully`);
        
        // Test the key after saving
        try {
          setIsTesting(true);
          const testSuccess = await testApiKey(provider.serviceKey, apiKey);
          setTestSuccessful(testSuccess);
          
          if (!testSuccess) {
            setError(`${provider.name} API key was saved but could not be verified. Please check that the key is valid and try testing again.`);
          }
        } catch (testError: any) {
          console.error(`Error testing ${provider.name} API key after save:`, testError);
          setError(testError.message || `Failed to verify ${provider.name} API key after saving`);
        } finally {
          setIsTesting(false);
        }
      }
    } catch (error: any) {
      console.error(`Error saving ${provider.name} API key:`, error);
      setError(error.message || `Failed to save ${provider.name} API key`);
      toast.error(error.message || `Failed to save ${provider.name} API key`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      setError(null);
      
      // For SERP API, show special instructions if the key is empty or invalid
      if (provider.serviceKey === 'serp' && (!apiKey.trim() || apiKey.includes('SERP_API_KEY'))) {
        setError('Please enter a valid SERP API key. You can get one from https://serpapi.com');
        setIsTesting(false);
        return;
      }
      
      console.log(`Testing ${provider.name} API key...`);
      
      // Always use the current value in the input field for testing
      const success = await testApiKey(provider.serviceKey, apiKey);
      setTestSuccessful(success);
      
      if (!success) {
        if (provider.serviceKey === 'serp') {
          setError(`SERP API key could not be verified. Please check:
          
1. The key is correct and copied exactly from your SerpApi dashboard
2. Your SerpApi account has available credits
3. Your network connection allows access to serpapi.com
4. Try clearing your browser cache and refreshing the page`);
        } else {
          setError(`${provider.name} API key could not be verified. Please double-check that you've entered a valid API key.`);
        }
      }
    } catch (error: any) {
      console.error(`Error testing ${provider.name} API key:`, error);
      setError(error.message || `Failed to test ${provider.name} API key`);
      setTestSuccessful(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeleteKey = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      const success = await deleteApiKey(provider.serviceKey);
      
      if (success) {
        setApiKey("");
        setKeyExists(false);
        setIsActive(false);
        setTestSuccessful(false);
        toast.success(`${provider.name} API key deleted successfully`);
      }
    } catch (error: any) {
      console.error(`Error deleting ${provider.name} API key:`, error);
      setError(error.message || `Failed to delete ${provider.name} API key`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDetectKeyType = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key to detect');
      return;
    }

    try {
      setIsDetecting(true);
      setError(null);
      const detectedType = await detectApiKeyType(apiKey);
      
      if (detectedType && detectedType !== provider.serviceKey) {
        toast.info(`This appears to be a ${detectedType.toUpperCase()} API key. Would you like to use it there instead?`);
      } else if (detectedType === provider.serviceKey) {
        toast.success(`Confirmed as a valid ${provider.name} API key format`);
      } else {
        toast.error('Unable to detect API key type');
      }
    } catch (error: any) {
      console.error('Error detecting API key type:', error);
      setError(error.message || 'Failed to detect API key type');
    } finally {
      setIsDetecting(false);
    }
  };

  return {
    apiKey,
    setApiKey,
    isLoading,
    isSaving,
    isTesting,
    isDeleting,
    isDetecting,
    keyExists,
    isActive,
    setIsActive,
    testSuccessful,
    error,
    setError,
    handleSaveKey,
    handleTestConnection,
    handleDeleteKey,
    handleDetectKeyType
  };
};
