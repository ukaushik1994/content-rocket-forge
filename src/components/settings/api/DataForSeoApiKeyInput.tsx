
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Key, Save, Check, AlertCircle, Loader2, TestTube, Trash2 } from "lucide-react";
import { 
  saveApiKey, 
  getApiKey, 
  testApiKey, 
  deleteApiKey,
  isDataForSeoFormat,
  encodeDataForSeoCredentials,
  decodeDataForSeoCredentials
} from "@/services/apiKeyService";
import { ApiProvider } from './types';

interface DataForSeoApiKeyInputProps {
  provider: ApiProviderWithCategory;
}

export const DataForSeoApiKeyInput: React.FC<DataForSeoApiKeyInputProps> = ({ provider }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [keyExists, setKeyExists] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [testSuccessful, setTestSuccessful] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const encodedCredentials = await getApiKey(provider.serviceKey);
        
        if (encodedCredentials) {
          const { email: decodedEmail, password: decodedPassword } = decodeDataForSeoCredentials(encodedCredentials);
          setEmail(decodedEmail);
          setPassword(decodedPassword);
          setKeyExists(true);
          setIsActive(true);
          
          // Test the credentials when loading
          try {
            const success = await testApiKey(provider.serviceKey, encodedCredentials);
            setTestSuccessful(success);
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
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!password.trim()) {
      setError('Password is required');
      return false;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleSaveCredentials = async () => {
    if (!validateCredentials()) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
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
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeleteCredentials = async () => {
    try {
      setIsDeleting(true);
      setError(null);
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
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 border border-white/10 shadow-lg">
        <div className="flex items-center justify-center h-40">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-primary"></div>
          <span className="ml-2 text-white/70">Loading credentials...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`border border-white/10 shadow-lg ${testSuccessful ? 'border-l-4 border-l-green-500' : keyExists ? 'border-l-4 border-l-yellow-500' : ''}`}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium">{provider.name}</h3>
            {keyExists && (
              <span className="ml-2 text-xs bg-green-600/20 text-green-500 px-2 py-1 rounded-full">
                {testSuccessful ? 'Verified' : 'Configured'}
              </span>
            )}
          </div>
        </div>
        
        <p className="text-sm text-white/70">{provider.description}</p>
        
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-md text-sm text-red-300">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={`${provider.id}-email`} className="text-sm text-white/70">
              Email
            </label>
            <Input
              id={`${provider.id}-email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/10"
              placeholder="Your DataForSEO email"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor={`${provider.id}-password`} className="text-sm text-white/70">
              Password
            </label>
            <Input
              id={`${provider.id}-password`}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border-white/10"
              placeholder="Your DataForSEO password"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4">
          <Button
            onClick={handleSaveCredentials}
            disabled={isSaving || isTesting || isDeleting}
            className={`flex-1 ${testSuccessful ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            {isSaving ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </span>
            ) : testSuccessful ? (
              <span className="flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Verified
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save
              </span>
            )}
          </Button>
          
          <Button
            onClick={handleTestConnection}
            disabled={isSaving || isTesting || isDeleting}
            variant="secondary"
            className="flex-1"
          >
            {isTesting ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </span>
            ) : (
              <span className="flex items-center">
                <TestTube className="h-4 w-4 mr-2" />
                Test
              </span>
            )}
          </Button>
          
          {keyExists && (
            <Button
              onClick={handleDeleteCredentials}
              disabled={isSaving || isTesting || isDeleting}
              variant="destructive"
              className="flex-1"
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </span>
              ) : (
                <span className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </span>
              )}
            </Button>
          )}
        </div>
        
        <div className="bg-white/5 p-3 rounded text-xs text-white/70 border border-white/10">
          <p>DataForSEO setup instructions:</p>
          <ul className="list-disc pl-4 mt-1 space-y-1">
            <li>Create an account at <a href="https://dataforseo.com/" target="_blank" rel="noreferrer" className="text-blue-400 underline">DataForSEO</a></li>
            <li>Use your DataForSEO account email and password</li>
            <li>Click "Test" to verify your credentials</li>
            <li>Your credentials are stored locally for security</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
