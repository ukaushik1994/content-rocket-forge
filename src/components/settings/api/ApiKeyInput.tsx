
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  saveApiKey, 
  getApiKey, 
  testApiKey, 
  deleteApiKey,
  detectApiKeyType 
} from "@/services/apiKeyService";
import { ApiProvider } from './types';
import { ApiKeyCard } from './ApiKeyCard';
import { ApiKeyHeader } from './ApiKeyHeader';
import { ApiKeyStatus } from './ApiKeyStatus';
import { ApiKeyForm } from './ApiKeyForm';
import { ApiKeyActions } from './ApiKeyActions';
import { ApiKeyLoading } from './ApiKeyLoading';

interface ApiKeyInputProps {
  provider: ApiProvider;
}

export const ApiKeyInput = ({ provider }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [keyExists, setKeyExists] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [testSuccessful, setTestSuccessful] = useState(false);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setIsLoading(true);
        const key = await getApiKey(provider.serviceKey);
        if (key) {
          setApiKey(key);
          setKeyExists(true);
          setIsActive(true);
          // Try to test the key when loading
          const success = await testApiKey(provider.serviceKey, key);
          setTestSuccessful(success);
        }
      } catch (error) {
        console.error(`Error fetching ${provider.name} API key:`, error);
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
      const success = await saveApiKey(provider.serviceKey, apiKey);
      if (success) {
        setKeyExists(true);
        setIsActive(true);
        toast.success(`${provider.name} API key saved successfully`);
        
        // Test the key after saving
        const testSuccess = await testApiKey(provider.serviceKey, apiKey);
        setTestSuccessful(testSuccess);
      }
    } catch (error) {
      console.error(`Error saving ${provider.name} API key:`, error);
      toast.error(`Failed to save ${provider.name} API key`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      const success = await testApiKey(provider.serviceKey, apiKey);
      setTestSuccessful(success);
      if (success) {
        toast.success(`${provider.name} connection successful`);
      } else {
        toast.error(`${provider.name} connection failed`);
      }
    } catch (error) {
      console.error(`Error testing ${provider.name} API key:`, error);
      toast.error(`Failed to test ${provider.name} API key`);
      setTestSuccessful(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeleteKey = async () => {
    try {
      setIsDeleting(true);
      const success = await deleteApiKey(provider.serviceKey);
      if (success) {
        setApiKey("");
        setKeyExists(false);
        setIsActive(false);
        setTestSuccessful(false);
        toast.success(`${provider.name} API key deleted successfully`);
      }
    } catch (error) {
      console.error(`Error deleting ${provider.name} API key:`, error);
      toast.error(`Failed to delete ${provider.name} API key`);
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
      const detectedType = await detectApiKeyType(apiKey);
      
      if (detectedType && detectedType !== provider.serviceKey) {
        toast.info(`This appears to be a ${detectedType.toUpperCase()} API key. Would you like to use it there instead?`);
      } else if (detectedType === provider.serviceKey) {
        toast.success(`Confirmed as a valid ${provider.name} API key format`);
      } else {
        toast.error('Unable to detect API key type');
      }
    } catch (error) {
      console.error('Error detecting API key type:', error);
      toast.error('Failed to detect API key type');
    } finally {
      setIsDetecting(false);
    }
  };

  if (isLoading) {
    return <ApiKeyLoading />;
  }

  return (
    <ApiKeyCard 
      provider={provider} 
      keyExists={keyExists} 
      testSuccessful={testSuccessful}
    >
      <ApiKeyHeader 
        provider={provider} 
        keyExists={keyExists} 
        testSuccessful={testSuccessful}
        isActive={isActive}
        setIsActive={setIsActive}
      />
      
      <ApiKeyStatus 
        provider={provider} 
        keyExists={keyExists} 
        testSuccessful={testSuccessful} 
      />
      
      <ApiKeyForm 
        provider={provider} 
        apiKey={apiKey} 
        setApiKey={setApiKey} 
        keyExists={keyExists} 
        testSuccessful={testSuccessful} 
      />

      <ApiKeyActions 
        provider={provider}
        apiKey={apiKey}
        keyExists={keyExists}
        testSuccessful={testSuccessful}
        isSaving={isSaving}
        isTesting={isTesting}
        isDeleting={isDeleting}
        isDetecting={isDetecting}
        onSave={handleSaveKey}
        onTest={handleTestConnection}
        onDelete={handleDeleteKey}
        onDetect={handleDetectKeyType}
      />
    </ApiKeyCard>
  );
};
