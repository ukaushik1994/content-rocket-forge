import React, { useState, useEffect } from 'react';
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
import { ProviderCard } from './ProviderCard';
import { ProviderHeader } from './ProviderHeader';
import { ProviderStatus } from './ProviderStatus';
import { ProviderKeyManager } from './ProviderKeyManager';
import { ProviderTestPanel, TestResponse } from './ProviderTestPanel';
import { ProviderConfigPanel } from './ProviderConfigPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react';
import { ApiProviderConfig } from '../settings/api/types';

export interface DataForSeoCredentials {
  login: string;
  password: string;
}

export interface DataForSeoProviderProps {
  provider: ApiProviderConfig;
  className?: string;
}

export const DataForSeoProvider = ({ 
  provider,
  className
}: DataForSeoProviderProps) => {
  const [credentials, setCredentials] = useState<DataForSeoCredentials>({
    login: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [encodedCredentials, setEncodedCredentials] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [keyExists, setKeyExists] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [testSuccessful, setTestSuccessful] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('credentials');
  
  // Config options for DataForSEO (optional settings that could be saved)
  const configOptions = [
    {
      id: 'rateLimit',
      label: 'Rate Limit (requests per minute)',
      type: 'slider' as const,
      value: 60,
      min: 10,
      max: 100,
      step: 5,
      description: 'Maximum number of API requests to make per minute'
    },
    {
      id: 'cacheResults',
      label: 'Cache Results',
      type: 'boolean' as const,
      value: true,
      description: 'Store API results in local cache to reduce API calls'
    },
    {
      id: 'defaultLocation',
      label: 'Default Location',
      type: 'select' as const,
      value: 'us',
      options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
        { value: 'au', label: 'Australia' }
      ],
      description: 'Default location for SERP data'
    }
  ];
  
  // Determine the status for visual display
  const getStatus = () => {
    if (isLoading) return 'loading';
    if (error) return 'error';
    if (provider.required && !keyExists) return 'required';
    if (keyExists && testSuccessful) return 'connected';
    if (keyExists && !testSuccessful) return 'not-verified';
    return 'none';
  };

  // Encode credentials when login/password change
  useEffect(() => {
    if (credentials.login && credentials.password) {
      const encoded = encodeDataForSeoCredentials(credentials.login, credentials.password);
      setEncodedCredentials(encoded);
    } else {
      setEncodedCredentials('');
    }
  }, [credentials]);

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
  }, [provider]);

  // Save credentials
  const handleSaveCredentials = async () => {
    if (!credentials.login || !credentials.password) {
      toast.error('Please enter both login and password');
      return;
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
    } catch (error: any) {
      console.error(`Error saving ${provider.name} credentials:`, error);
      setError(error.message || `Failed to save ${provider.name} credentials`);
      toast.error(error.message || `Failed to save ${provider.name} credentials`);
    } finally {
      setIsSaving(false);
    }
  };

  // Test credentials
  const handleTestCredentials = async (): Promise<TestResponse> => {
    try {
      setIsTesting(true);
      setError(null);
      
      if (!provider.serviceKey) {
        throw new Error('Service key is not defined for this provider');
      }
      
      // Use the current encoded credentials for testing
      const success = await testApiKey(provider.serviceKey, encodedCredentials);
      setTestSuccessful(success);
      
      if (success) {
        toast.success(`${provider.name} credentials verified successfully`);
      } else {
        setError(`${provider.name} credentials could not be verified.`);
        toast.error(`${provider.name} credentials could not be verified`);
      }

      return { 
        success, 
        data: success ? { message: 'Connection successful' } : undefined,
        error: success ? undefined : 'Authentication failed',
        responseTime: Math.floor(Math.random() * 200) + 100, // Simulate response time
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error(`Error testing ${provider.name} credentials:`, error);
      setError(error.message || `Failed to test ${provider.name} credentials`);
      setTestSuccessful(false);
      toast.error(error.message || `Failed to test ${provider.name} credentials`);
      
      return {
        success: false,
        error: error.message || `Failed to test ${provider.name} credentials`,
        timestamp: new Date()
      };
    } finally {
      setIsTesting(false);
    }
  };

  // Run advanced test with options
  const handleAdvancedTest = async (key: string, options?: any): Promise<TestResponse> => {
    try {
      setIsTesting(true);
      
      // In a real app, this would make an actual API call to DataForSEO
      // with the specified options
      console.log('Testing with options:', options);
      
      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const success = isDataForSeoFormat(key);
      
      // Simulate data based on the test
      let responseData = null;
      if (success && options?.query) {
        responseData = {
          task_id: Math.floor(Math.random() * 1000000),
          status_code: 20000,
          status_message: "Ok",
          tasks: [
            {
              id: Math.floor(Math.random() * 1000000),
              status_code: 20000,
              status_message: "Task Created",
              time: new Date().toISOString(),
              results: {
                organic_results: [
                  { position: 1, title: `Result for ${options.query}`, url: "https://example.com/1" },
                  { position: 2, title: `Another result for ${options.query}`, url: "https://example.com/2" }
                ],
                items_count: 2
              }
            }
          ]
        };
      }
      
      return {
        success: success,
        data: responseData,
        error: success ? undefined : 'Authentication failed or invalid request',
        responseTime: Math.floor(Math.random() * 500) + 300,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
        timestamp: new Date()
      };
    } finally {
      setIsTesting(false);
    }
  };

  // Delete credentials - make it consistent by accepting any key parameter but not using it
  const handleDeleteCredentials = async (_key?: string): Promise<boolean> => {
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
  
  // Save provider configuration
  const handleSaveConfig = async (providerId: string, config: Record<string, any>): Promise<boolean> => {
    // In a real app, this would save to a user preferences store
    console.log('Saving config for', providerId, config);
    return true;
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="mb-4">
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="credentials" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Login</Label>
              <Input
                id="login"
                value={credentials.login}
                onChange={(e) => setCredentials(prev => ({ ...prev, login: e.target.value }))}
                placeholder="DataForSEO login email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="flex justify-between">
                <span>Password</span>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <span className="flex items-center">
                      <EyeOff size={12} className="mr-1" /> Hide
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Eye size={12} className="mr-1" /> Show
                    </span>
                  )}
                </button>
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="DataForSEO API password"
              />
            </div>
            
            {provider.docsUrl && (
              <div className="text-xs text-white/60">
                <span>Don't have credentials? </span>
                <a 
                  href={provider.docsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:text-blue-300"
                >
                  Get API Documentation
                </a>
                {provider.signupUrl && (
                  <>
                    <span> or </span>
                    <a 
                      href={provider.signupUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Sign Up
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              {keyExists && (
                <ProviderKeyManager
                  provider={provider}
                  apiKey={encodedCredentials}
                  keyExists={keyExists}
                  onSave={handleSaveCredentials}
                  onDelete={handleDeleteCredentials}
                />
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {keyExists ? (
                <Button 
                  variant={testSuccessful ? "outline" : "default"}
                  onClick={handleTestCredentials}
                  disabled={isTesting}
                >
                  {isTesting ? 'Testing...' : (testSuccessful ? 'Verified' : 'Test Connection')}
                </Button>
              ) : (
                <Button 
                  onClick={handleSaveCredentials} 
                  disabled={isSaving || !credentials.login || !credentials.password}
                >
                  {isSaving ? 'Saving...' : 'Save Credentials'}
                </Button>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="testing">
          <ProviderTestPanel
            provider={provider}
            apiKey={encodedCredentials}
            onTest={handleAdvancedTest}
            isTesting={isTesting}
          />
        </TabsContent>
        
        <TabsContent value="configuration">
          <ProviderConfigPanel
            provider={provider}
            configOptions={configOptions}
            onSaveConfig={handleSaveConfig}
          />
        </TabsContent>
      </Tabs>
      
      {provider.docsUrl && (
        <>
          <Separator className="my-4" />
          <div className="flex justify-between text-xs text-white/60">
            <a 
              href={provider.docsUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:text-blue-300"
            >
              Documentation
            </a>
            {provider.signupUrl && (
              <a 
                href={provider.signupUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300"
              >
                Sign Up
              </a>
            )}
            <a 
              href="https://dataforseo.com/contact-us" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:text-blue-300"
            >
              Support
            </a>
          </div>
        </>
      )}
    </ProviderCard>
  );
};
