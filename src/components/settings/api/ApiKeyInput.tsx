
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  saveApiKey, 
  getApiKey, 
  testApiKey, 
  deleteApiKey,
  detectApiKeyType,
  type ApiProvider 
} from "@/services/apiKeyService";
import { ApiProvider as ApiProviderType } from './types';
import { ApiKeyCard } from './ApiKeyCard';
import { ApiKeyHeader } from './ApiKeyHeader';
import { ApiKeyStatus } from './ApiKeyStatus';
import { ApiKeyForm } from './ApiKeyForm';
import { ApiKeyActions } from './ApiKeyActions';
import { ApiKeyLoading } from './ApiKeyLoading';

interface ApiKeyInputProps {
  provider: ApiProviderType;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log(`🔍 Fetching ${provider.name} API key from database`);
        
        const key = await getApiKey(provider.serviceKey as ApiProvider);
        
        if (key) {
          console.log(`✅ ${provider.name} API key found in database`);
          setApiKey(key);
          setKeyExists(true);
          setIsActive(true);
          
          // Test the key immediately when loading
          console.log(`🧪 Testing ${provider.name} API key on load`);
          try {
            const success = await testApiKey(provider.serviceKey as ApiProvider, key);
            setTestSuccessful(success);
            if (success) {
              console.log(`✅ ${provider.name} API key verified successfully`);
            } else {
              console.warn(`⚠️ ${provider.name} API key test failed during initialization`);
              setError(`${provider.name} API key is configured but could not be verified. Please check the key in Settings.`);
            }
          } catch (testError) {
            console.error(`💥 Error testing ${provider.name} API key:`, testError);
            setError(`Failed to verify ${provider.name} API key`);
          }
        } else {
          console.log(`❌ No ${provider.name} API key found in database`);
        }
      } catch (error: any) {
        console.error(`💥 Error fetching ${provider.name} API key:`, error);
        setError(error.message || `Failed to load ${provider.name} API key`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, [provider]);

  const handleSaveKey = async () => {
    if (!apiKey || !apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      console.log(`💾 Saving ${provider.name} API key`);

      const success = await saveApiKey(provider.serviceKey as ApiProvider, apiKey);
      
      if (success) {
        setKeyExists(true);
        setIsActive(true);
        toast.success(`${provider.name} API key saved successfully`);
        
        // Test the key after saving
        console.log(`🧪 Testing ${provider.name} API key after save`);
        try {
          setIsTesting(true);
          const testSuccess = await testApiKey(provider.serviceKey as ApiProvider, apiKey);
          setTestSuccessful(testSuccess);
          
          if (testSuccess) {
            console.log(`✅ ${provider.name} API key verified after save`);
            toast.success(`${provider.name} API key verified successfully`);
          } else {
            console.warn(`⚠️ ${provider.name} API key saved but verification failed`);
            setError(`${provider.name} API key was saved but could not be verified. Please check the key format.`);
          }
        } catch (testError: any) {
          console.error(`💥 Error testing ${provider.name} API key after save:`, testError);
          setError(testError.message || `Failed to verify ${provider.name} API key after saving`);
        } finally {
          setIsTesting(false);
        }
      }
    } catch (error: any) {
      console.error(`💥 Error saving ${provider.name} API key:`, error);
      setError(error.message || `Failed to save ${provider.name} API key`);
      toast.error(error.message || `Failed to save ${provider.name} API key`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey || !apiKey.trim()) {
      toast.error('Please enter an API key to test');
      return;
    }

    try {
      setIsTesting(true);
      setError(null);
      console.log(`🧪 Testing ${provider.name} API key connection`);
      
      // Always use the current value in the input field for testing
      const success = await testApiKey(provider.serviceKey as ApiProvider, apiKey);
      setTestSuccessful(success);
      
      if (success) {
        console.log(`✅ ${provider.name} API key test successful`);
        toast.success(`${provider.name} API key is working correctly`);
      } else {
        console.warn(`⚠️ ${provider.name} API key test failed`);
        setError(`${provider.name} API key could not be verified. Please check the key format and try again.`);
        toast.error(`${provider.name} API key verification failed`);
      }
    } catch (error: any) {
      console.error(`💥 Error testing ${provider.name} API key:`, error);
      setError(error.message || `Failed to test ${provider.name} API key`);
      setTestSuccessful(false);
      toast.error(error.message || `Failed to test ${provider.name} API key`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeleteKey = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      console.log(`🗑️ Deleting ${provider.name} API key`);
      
      const success = await deleteApiKey(provider.serviceKey as ApiProvider);
      
      if (success) {
        setApiKey("");
        setKeyExists(false);
        setIsActive(false);
        setTestSuccessful(false);
        toast.success(`${provider.name} API key deleted successfully`);
        console.log(`✅ ${provider.name} API key deleted successfully`);
      }
    } catch (error: any) {
      console.error(`💥 Error deleting ${provider.name} API key:`, error);
      setError(error.message || `Failed to delete ${provider.name} API key`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDetectKeyType = async () => {
    if (!apiKey || !apiKey.trim()) {
      toast.error('Please enter an API key to detect');
      return;
    }

    try {
      setIsDetecting(true);
      setError(null);
      console.log('🔍 Detecting API key type');
      
      const detectedType = await detectApiKeyType(apiKey);
      
      if (detectedType && detectedType !== provider.serviceKey) {
        toast.info(`This appears to be a ${detectedType.toUpperCase()} API key. Would you like to use it there instead?`);
        console.log(`🔍 Detected ${detectedType} API key format`);
      } else if (detectedType === provider.serviceKey) {
        toast.success(`Confirmed as a valid ${provider.name} API key format`);
        console.log(`✅ Confirmed ${provider.name} API key format`);
      } else {
        toast.error('Unable to detect API key type');
        console.warn('❓ Could not detect API key type');
      }
    } catch (error: any) {
      console.error('💥 Error detecting API key type:', error);
      setError(error.message || 'Failed to detect API key type');
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
      
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-md text-sm text-red-300">
          {error}
        </div>
      )}
      
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
