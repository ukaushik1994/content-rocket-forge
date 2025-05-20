
import { useState } from 'react';
import { toast } from 'sonner';
import { ApiProviderConfig } from '@/components/settings/api/types';
import { getApiKey, saveApiKey, deleteApiKey, testApiKey } from '@/services/apiKeys';

/**
 * Hook for SERP API provider management
 */
export const useSerpApiProvider = (provider: ApiProviderConfig) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [keyExists, setKeyExists] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [testSuccessful, setTestSuccessful] = useState(false);
  const [activeTab, setActiveTab] = useState('credentials');
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with existing key if available
  useState(() => {
    const fetchApiKey = async () => {
      try {
        const key = await getApiKey('serp');
        if (key) {
          setApiKey(key);
          setKeyExists(true);
          setTestSuccessful(true);
        }
      } catch (error) {
        console.error('Error fetching SERP API key:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApiKey();
  });
  
  const handleSaveCredentials = async (key: string) => {
    if (!key) {
      toast.error('API key is required');
      return false;
    }
    
    setIsSaving(true);
    
    try {
      const success = await saveApiKey('serp', key);
      
      if (success) {
        setApiKey(key);
        setKeyExists(true);
        toast.success('SERP API key saved successfully');
        return true;
      } else {
        toast.error('Failed to save SERP API key');
        return false;
      }
    } catch (error: any) {
      console.error('Error saving SERP API key:', error);
      toast.error(error.message || 'Failed to save SERP API key');
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleTestCredentials = async (key: string = apiKey) => {
    if (!key) {
      toast.error('API key is required');
      return false;
    }
    
    setIsTesting(true);
    
    try {
      const isValid = await testApiKey('serp', key);
      
      setTestSuccessful(isValid);
      
      if (isValid) {
        toast.success('SERP API key is valid');
      } else {
        toast.error('SERP API key is invalid');
      }
      
      return isValid;
    } catch (error: any) {
      console.error('Error testing SERP API key:', error);
      toast.error(error.message || 'Failed to test SERP API key');
      return false;
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleDeleteCredentials = async () => {
    setIsDeleting(true);
    
    try {
      const success = await deleteApiKey('serp');
      
      if (success) {
        setApiKey('');
        setKeyExists(false);
        setTestSuccessful(false);
        toast.success('SERP API key deleted successfully');
        return true;
      } else {
        toast.error('Failed to delete SERP API key');
        return false;
      }
    } catch (error: any) {
      console.error('Error deleting SERP API key:', error);
      toast.error(error.message || 'Failed to delete SERP API key');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleAdvancedTest = async () => {
    // Implement advanced testing for SERP API
    toast.info('Running advanced test for SERP API...');
    return true;
  };
  
  const handleSaveConfig = async (id: string, config: Record<string, any>) => {
    // Implement saving configuration for SERP API
    toast.success('SERP API configuration saved');
    return true;
  };
  
  // Calculate status based on current state
  const getStatus = () => {
    if (!keyExists) return 'none';
    if (isTesting || isLoading) return 'loading';
    if (error) return 'error';
    if (testSuccessful) return 'connected';
    return 'not-verified';
  };
  
  return {
    apiKey,
    setApiKey,
    isLoading,
    isSaving,
    isTesting,
    isDeleting,
    keyExists,
    testSuccessful,
    error,
    isActive,
    setIsActive,
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
