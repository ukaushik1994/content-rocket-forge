
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ApiProviderConfig } from '@/components/settings/api/types';
import { getApiKey, saveApiKey, deleteApiKey, testApiKey } from '@/services/apiKeys';

/**
 * Hook for Anthropic provider management
 */
export const useAnthropicProvider = (provider: ApiProviderConfig) => {
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
        const key = await getApiKey('anthropic');
        if (key) {
          setApiKey(key);
          setKeyExists(true);
          setTestSuccessful(true);
        }
      } catch (error) {
        console.error('Error fetching Anthropic API key:', error);
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
      const success = await saveApiKey('anthropic', key);
      
      if (success) {
        setApiKey(key);
        setKeyExists(true);
        toast.success('Anthropic API key saved successfully');
        return true;
      } else {
        toast.error('Failed to save Anthropic API key');
        return false;
      }
    } catch (error: any) {
      console.error('Error saving Anthropic API key:', error);
      toast.error(error.message || 'Failed to save Anthropic API key');
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
      const isValid = await testApiKey('anthropic', key);
      
      setTestSuccessful(isValid);
      
      if (isValid) {
        toast.success('Anthropic API key is valid');
      } else {
        toast.error('Anthropic API key is invalid');
      }
      
      return isValid;
    } catch (error: any) {
      console.error('Error testing Anthropic API key:', error);
      toast.error(error.message || 'Failed to test Anthropic API key');
      return false;
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleDeleteCredentials = async () => {
    setIsDeleting(true);
    
    try {
      const success = await deleteApiKey('anthropic');
      
      if (success) {
        setApiKey('');
        setKeyExists(false);
        setTestSuccessful(false);
        toast.success('Anthropic API key deleted successfully');
        return true;
      } else {
        toast.error('Failed to delete Anthropic API key');
        return false;
      }
    } catch (error: any) {
      console.error('Error deleting Anthropic API key:', error);
      toast.error(error.message || 'Failed to delete Anthropic API key');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleAdvancedTest = async () => {
    if (!apiKey) {
      toast.error('API key is required for testing');
      return false;
    }
    
    setIsTesting(true);
    toast.info('Testing Anthropic API access...');
    
    try {
      // We'll just verify the key is valid here
      const isValid = await testApiKey('anthropic', apiKey);
      if (isValid) {
        toast.success('Anthropic API access verified successfully');
      } else {
        toast.error('Anthropic API access failed');
      }
      return isValid;
    } catch (error: any) {
      console.error('Error in advanced Anthropic test:', error);
      toast.error(error.message || 'Advanced Anthropic test failed');
      return false;
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleSaveConfig = async (id: string, config: Record<string, any>) => {
    // Save configuration for Anthropic
    toast.success('Anthropic configuration saved');
    
    // Store configuration in localStorage for now
    localStorage.setItem('anthropic_config', JSON.stringify(config));
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
