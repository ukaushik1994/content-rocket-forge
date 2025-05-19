
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  saveApiKey, 
  getApiKey, 
  testApiKey, 
  deleteApiKey
} from "@/services/apiKeyService";
import { detectApiKeyType } from '@/services/apiKeys/validation';
import { ProviderCard } from './ProviderCard';
import { ProviderHeader } from './ProviderHeader';
import { ProviderStatus } from './ProviderStatus';
import { ProviderForm } from './ProviderForm';
import { ProviderActions } from './ProviderActions';
import { ApiProviderConfig } from '../settings/api/types';

export interface StandardApiProviderProps {
  provider: ApiProviderConfig;
  className?: string;
}

export const StandardApiProvider = ({ 
  provider,
  className
}: StandardApiProviderProps) => {
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
  
  // Determine the status for visual display
  const getStatus = () => {
    if (isLoading) return 'loading';
    if (error) return 'error';
    if (provider.required && !keyExists) return 'required';
    if (keyExists && testSuccessful) return 'connected';
    if (keyExists && !testSuccessful) return 'not-verified';
    return 'none';
  };

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!provider.serviceKey) {
          throw new Error('Service key is not defined for this provider');
        }
        
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
      
      if (!provider.serviceKey) {
        throw new Error('Service key is not defined for this provider');
      }
      
      const success = await saveApiKey(provider.serviceKey, apiKey);
      
      if (success) {
        setKeyExists(true);
        setIsActive(true);
        toast.success(`${provider.name} API key saved successfully`);
        
        // Test the key after saving
        try {
          const testSuccess = await testApiKey(provider.serviceKey, apiKey);
          setTestSuccessful(testSuccess);
          
          if (!testSuccess) {
            setError(`${provider.name} API key was saved but could not be verified.`);
          }
        } catch (testError: any) {
          console.error(`Error testing ${provider.name} API key after save:`, testError);
          setError(testError.message || `Failed to verify ${provider.name} API key after saving`);
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
      
      if (!provider.serviceKey) {
        throw new Error('Service key is not defined for this provider');
      }
      
      // Always use the current value in the input field for testing
      const success = await testApiKey(provider.serviceKey, apiKey);
      setTestSuccessful(success);
      
      if (success) {
        toast.success(`${provider.name} API key verified successfully`);
      } else {
        setError(`${provider.name} API key could not be verified.`);
        toast.error(`${provider.name} API key could not be verified`);
      }
    } catch (error: any) {
      console.error(`Error testing ${provider.name} API key:`, error);
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
      
      if (!provider.serviceKey) {
        throw new Error('Service key is not defined for this provider');
      }
      
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
      toast.error(error.message || `Failed to delete ${provider.name} API key`);
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
      toast.error(error.message || 'Failed to detect API key type');
    } finally {
      setIsDetecting(false);
    }
  };

  const status = getStatus();

  return (
    <ProviderCard 
      provider={provider} 
      status={status as any}
      className={className}
    >
      <ProviderHeader 
        provider={provider} 
        status={status as any}
        isActive={isActive}
        setIsActive={setIsActive}
      />
      
      {error && <ProviderStatus provider={provider} status="error" message={error} />}
      
      {!error && status !== 'none' && (
        <ProviderStatus 
          provider={provider} 
          status={status as any}
        />
      )}
      
      <ProviderForm 
        provider={provider} 
        value={apiKey} 
        setValue={setApiKey} 
        status={status as any}
      />

      <ProviderActions 
        provider={provider}
        hasValue={!!apiKey}
        status={status as any}
        isSaving={isSaving}
        isTesting={isTesting}
        isDeleting={isDeleting}
        isDetecting={isDetecting}
        onSave={handleSaveKey}
        onTest={handleTestConnection}
        onDelete={handleDeleteKey}
        onDetect={provider.autoDetectable ? handleDetectKeyType : undefined}
      />
    </ProviderCard>
  );
};
