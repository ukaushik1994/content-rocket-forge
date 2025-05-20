
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Key } from 'lucide-react';
import { toast } from 'sonner';
import { SerpApiAdapter } from '@/services/serp/adapters/SerpApiAdapter';
import { setPreferredSerpProvider, clearCachedApiKeyCheck } from '@/services/serpApiService';

interface SerpApiKeySetupProps {
  onConfigured?: () => void;
}

export function SerpApiKeySetup({ onConfigured }: SerpApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [existingKey, setExistingKey] = useState<string | null>(null);

  // Check for existing API key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('serp_api_key');
    
    if (storedKey) {
      setExistingKey(storedKey);
      setIsValidated(true);
      console.log('Found existing SERP API key');
      
      // If onConfigured callback is provided, call it
      if (onConfigured) {
        onConfigured();
      }
    }
  }, [onConfigured]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    setIsValidated(false);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    try {
      setIsLoading(true);
      
      // Test the API key
      const adapter = new SerpApiAdapter();
      const isValid = await adapter.testApiKey(apiKey);
      
      if (isValid) {
        // Save API key to local storage
        localStorage.setItem('serp_api_key', apiKey);
        
        // Set as preferred provider
        setPreferredSerpProvider('serpapi');
        
        // Update state
        setExistingKey(apiKey);
        setIsValidated(true);
        setApiKey('');
        
        // Clear the cached API key check to force re-checking
        clearCachedApiKeyCheck();
        
        toast.success('SERP API key saved successfully');
        
        // If onConfigured callback is provided, call it
        if (onConfigured) {
          onConfigured();
        }
      } else {
        toast.error('Invalid API key. Please check and try again.');
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      toast.error('Failed to validate API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveApiKey = () => {
    // Remove API key from local storage
    localStorage.removeItem('serp_api_key');
    
    // Update state
    setExistingKey(null);
    setIsValidated(false);
    
    // Clear the cached API key check
    clearCachedApiKeyCheck();
    
    toast.info('SERP API key removed');
  };

  return (
    <Card className="border-blue-500/20">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500/20 p-2 rounded-full">
              <Key className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium">SERP API Key</h3>
              <p className="text-sm text-muted-foreground">
                {existingKey ? 'Your API key is configured' : 'Enter your SERP API key to enable keyword research'}
              </p>
            </div>
          </div>

          {existingKey ? (
            <div>
              <div className="flex items-center gap-2 bg-green-500/10 text-green-500 p-3 rounded-md mb-4">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">API key validated and ready to use</span>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRemoveApiKey}
                >
                  Remove API Key
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serpapi-key">API Key</Label>
                <Input
                  id="serpapi-key"
                  type="password"
                  placeholder="Enter your SERP API key"
                  value={apiKey}
                  onChange={handleInputChange}
                  className="font-mono"
                />
              </div>
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-start gap-2 text-amber-500/80 text-xs">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>
                    You need a valid SERP API key to use the keyword research features. 
                    <a 
                      href="https://serpapi.com/users/sign_up"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 ml-1 hover:underline"
                    >
                      Get a key here
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="default"
                  onClick={handleSaveApiKey}
                  disabled={isLoading || !apiKey.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Validating...' : 'Save API Key'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
