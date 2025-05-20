
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ApiProviderConfig } from '@/components/settings/api/types';
import { getApiKey, saveApiKey, deleteApiKey, testApiKey } from '@/services/apiKeys';

/**
 * Hook for OpenAI provider management
 */
export const useOpenAiProvider = (provider: ApiProviderConfig) => {
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
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const key = await getApiKey('openai');
        if (key) {
          setApiKey(key);
          setKeyExists(true);
          setTestSuccessful(true);
        }
      } catch (error) {
        console.error('Error fetching OpenAI API key:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApiKey();
  }, []);
  
  const handleSaveCredentials = async (key: string) => {
    if (!key) {
      toast.error('API key is required');
      return false;
    }
    
    setIsSaving(true);
    
    try {
      const success = await saveApiKey('openai', key);
      
      if (success) {
        setApiKey(key);
        setKeyExists(true);
        toast.success('OpenAI API key saved successfully');
        return true;
      } else {
        toast.error('Failed to save OpenAI API key');
        return false;
      }
    } catch (error: any) {
      console.error('Error saving OpenAI API key:', error);
      toast.error(error.message || 'Failed to save OpenAI API key');
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
      const isValid = await testApiKey('openai', key);
      
      setTestSuccessful(isValid);
      
      if (isValid) {
        toast.success('OpenAI API key is valid');
      } else {
        toast.error('OpenAI API key is invalid');
      }
      
      return isValid;
    } catch (error: any) {
      console.error('Error testing OpenAI API key:', error);
      toast.error(error.message || 'Failed to test OpenAI API key');
      return false;
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleDeleteCredentials = async () => {
    setIsDeleting(true);
    
    try {
      const success = await deleteApiKey('openai');
      
      if (success) {
        setApiKey('');
        setKeyExists(false);
        setTestSuccessful(false);
        toast.success('OpenAI API key deleted successfully');
        return true;
      } else {
        toast.error('Failed to delete OpenAI API key');
        return false;
      }
    } catch (error: any) {
      console.error('Error deleting OpenAI API key:', error);
      toast.error(error.message || 'Failed to delete OpenAI API key');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleAdvancedTest = async () => {
    // Simple model list check for OpenAI
    if (!apiKey) {
      toast.error('API key is required for testing');
      return false;
    }
    
    setIsTesting(true);
    toast.info('Testing OpenAI model access...');
    
    try {
      // We'll just verify the key is valid here
      const isValid = await testApiKey('openai', apiKey);
      if (isValid) {
        toast.success('OpenAI API access verified successfully');
      } else {
        toast.error('OpenAI API access failed');
      }
      return isValid;
    } catch (error: any) {
      console.error('Error in advanced OpenAI test:', error);
      toast.error(error.message || 'Advanced OpenAI test failed');
      return false;
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleSaveConfig = async (id: string, config: Record<string, any>) => {
    // Save configuration for OpenAI
    toast.success('OpenAI configuration saved');
    
    // Store configuration in localStorage for now
    localStorage.setItem('openai_config', JSON.stringify(config));
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
