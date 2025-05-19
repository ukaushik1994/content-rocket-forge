
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  saveApiKey, 
  getApiKey, 
  testApiKey, 
  deleteApiKey
} from "@/services/apiKeyService";
import { 
  encodeDataForSeoCredentials,
  decodeDataForSeoCredentials,
  isDataForSeoFormat
} from '@/services/apiKeys/validation';
import { ProviderCard } from './ProviderCard';
import { ProviderHeader } from './ProviderHeader';
import { ProviderStatus } from './ProviderStatus';
import { ProviderForm } from './ProviderForm';
import { ProviderActions } from './ProviderActions';
import { ApiProviderConfig } from '../settings/api/types';

export interface DataForSeoProviderProps {
  provider: ApiProviderConfig;
  className?: string;
}

export const DataForSeoProvider = ({ 
  provider,
  className
}: DataForSeoProviderProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [keyExists, setKeyExists] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [testSuccessful, setTestSuccessful] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
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
    const fetchCredentials = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!provider.serviceKey) {
          throw new Error('Service key is not defined for this provider');
        }
        
        const encodedCredentials = await getApiKey(provider.serviceKey);
        
        if (encodedCredentials && isDataForSeoFormat(encodedCredentials)) {
          const { email: decodedEmail, password: decodedPassword } = decodeDataForSeoCredentials(encodedCredentials);
          setEmail(decodedEmail);
          setPassword(decodedPassword);
          setKeyExists(true);
          setIsActive(true);
          
          // Test the credentials when loading
          try {
            const success = await testApiKey(provider.serviceKey, encodedCredentials);
            setTestSuccessful(success);
            if (!success) {
              console.warn(`${provider.name} credentials test failed during initialization`);
            }
          } catch (testError) {
            console.error(`Error testing ${provider.name} credentials:`, testError);
          }
        }
      } catch (error: any) {
        console.error(`Error fetching ${provider.name} credentials:`, error);
        setError(error.message || `Failed to load ${provider.name} credentials`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredentials();
  }, [provider]);

  const validateCredentials = (): boolean => {
    let isValid = true;
    
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else {
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address');
        isValid = false;
      } else {
        setEmailError(null);
      }
    }
    
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError(null);
    }
    
    return isValid;
  };

  const handleSaveCredentials = async () => {
    if (!validateCredentials()) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      if (!provider.serviceKey) {
        throw new Error('Service key is not defined for this provider');
      }
      
      const encodedCredentials = encodeDataForSeoCredentials(email, password);
      const success = await saveApiKey(provider.serviceKey, encodedCredentials);
      
      if (success) {
        setKeyExists(true);
        setIsActive(true);
        toast.success(`${provider.name} credentials saved successfully`);
        
        // Test the credentials after saving
        try {
          const testSuccess = await testApiKey(provider.serviceKey, encodedCredentials);
          setTestSuccessful(testSuccess);
          
          if (!testSuccess) {
            setError(`${provider.name} credentials were saved but could not be verified.`);
          }
        } catch (testError: any) {
          console.error(`Error testing ${provider.name} credentials after save:`, testError);
          setError(testError.message || `Failed to verify ${provider.name} credentials after saving`);
        }
      }
    } catch (error: any) {
      console.error(`Error saving ${provider.name} credentials:`, error);
      setError(error.message || `Failed to save ${provider.name} credentials`);
      toast.error(error.message || `Failed to save ${provider.name} credentials`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!validateCredentials()) {
      return;
    }

    try {
      setIsTesting(true);
      setError(null);
      
      if (!provider.serviceKey) {
        throw new Error('Service key is not defined for this provider');
      }
      
      const encodedCredentials = encodeDataForSeoCredentials(email, password);
      const success = await testApiKey(provider.serviceKey, encodedCredentials);
      
      setTestSuccessful(success);
      
      if (success) {
        toast.success(`Successfully connected to ${provider.name}!`);
      } else {
        setError(`${provider.name} credentials could not be verified.`);
        toast.error(`Failed to connect to ${provider.name}. Please check your credentials.`);
      }
    } catch (error: any) {
      console.error(`Error testing ${provider.name} credentials:`, error);
      setError(error.message || `Failed to test ${provider.name} credentials`);
      setTestSuccessful(false);
      toast.error(error.message || `Failed to test ${provider.name} credentials`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeleteCredentials = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      
      if (!provider.serviceKey) {
        throw new Error('Service key is not defined for this provider');
      }
      
      const success = await deleteApiKey(provider.serviceKey);
      
      if (success) {
        setEmail("");
        setPassword("");
        setKeyExists(false);
        setIsActive(false);
        setTestSuccessful(false);
        toast.success(`${provider.name} credentials deleted successfully`);
      }
    } catch (error: any) {
      console.error(`Error deleting ${provider.name} credentials:`, error);
      setError(error.message || `Failed to delete ${provider.name} credentials`);
      toast.error(error.message || `Failed to delete ${provider.name} credentials`);
    } finally {
      setIsDeleting(false);
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
      
      <div className="space-y-4">
        <ProviderForm 
          provider={provider} 
          value={email} 
          setValue={setEmail} 
          status={status as any}
          label="Email"
          type="email"
          placeholder={`Your ${provider.name} account email`}
          error={emailError}
        />
        
        <ProviderForm 
          provider={provider} 
          value={password} 
          setValue={setPassword} 
          status={status as any}
          label="Password"
          placeholder={`Your ${provider.name} account password`}
          error={passwordError}
        />
      </div>

      <ProviderActions 
        provider={provider}
        hasValue={!!email && !!password}
        status={status as any}
        isSaving={isSaving}
        isTesting={isTesting}
        isDeleting={isDeleting}
        onSave={handleSaveCredentials}
        onTest={handleTestConnection}
        onDelete={handleDeleteCredentials}
      />
      
      <div className="bg-white/5 p-3 rounded text-xs text-white/70 border border-white/10 mt-4">
        <p>{provider.name} setup instructions:</p>
        <ul className="list-disc pl-4 mt-1 space-y-1">
          <li>Create an account at <a href={provider.signupUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline">{provider.name}</a></li>
          <li>Use your {provider.name} account email and password</li>
          <li>Click "Test" to verify your credentials</li>
          <li>Your credentials are stored securely for protection</li>
        </ul>
      </div>
    </ProviderCard>
  );
};
