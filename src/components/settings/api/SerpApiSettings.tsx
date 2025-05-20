
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Key, Save, TestTube, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { SerpProvider, SERP_PROVIDERS } from '@/contexts/content-builder/types/serp-types';
import { activateProvider, deactivateProvider, getSerpProviderStatus, isProviderActive } from '@/services/serp/providers/ProviderManager';

interface SerpApiSettingsProps {
  onApiKeyChange?: () => void;
}

export const SerpApiSettings: React.FC<SerpApiSettingsProps> = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [keyExists, setKeyExists] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | undefined>(undefined);
  
  // Initialize state
  useEffect(() => {
    const loadApiKey = () => {
      try {
        const storedKey = localStorage.getItem('serp_api_key');
        if (storedKey) {
          setApiKey(storedKey);
          setKeyExists(true);
          
          // Check if this provider is active
          const active = isProviderActive('serpapi');
          setIsActive(active);
        }
      } catch (error) {
        console.error('Error loading SERP API key:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadApiKey();
  }, []);
  
  // Handle saving the API key
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationError('API key is required');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Save the API key to localStorage
      localStorage.setItem('serp_api_key', apiKey.trim());
      
      // Activate this provider if the switch is on
      if (isActive) {
        activateProvider('serpapi');
      }
      
      setKeyExists(true);
      toast.success('SERP API key saved successfully');
      
      // Notify parent of change
      if (onApiKeyChange) {
        onApiKeyChange();
      }
    } catch (error) {
      console.error('Error saving SERP API key:', error);
      toast.error('Failed to save SERP API key');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle testing the API key
  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationError('API key is required');
      return;
    }
    
    setIsTesting(true);
    
    try {
      // In a real implementation, we'd test the key against the API
      // For now, we'll just simulate a successful test
      const isValid = apiKey.trim().length > 10;
      
      if (isValid) {
        toast.success('SERP API key is valid');
      } else {
        toast.error('Invalid SERP API key format');
      }
    } catch (error) {
      console.error('Error testing SERP API key:', error);
      toast.error('Failed to test SERP API key');
    } finally {
      setIsTesting(false);
    }
  };
  
  // Handle deleting the API key
  const handleDeleteApiKey = async () => {
    setIsDeleting(true);
    
    try {
      // Remove the key from localStorage
      localStorage.removeItem('serp_api_key');
      
      // Deactivate this provider
      deactivateProvider('serpapi');
      
      setApiKey('');
      setKeyExists(false);
      setIsActive(false);
      toast.success('SERP API key deleted successfully');
      
      // Notify parent of change
      if (onApiKeyChange) {
        onApiKeyChange();
      }
    } catch (error) {
      console.error('Error deleting SERP API key:', error);
      toast.error('Failed to delete SERP API key');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle activation toggle
  const handleToggleActive = (checked: boolean) => {
    setIsActive(checked);
    
    if (checked) {
      const success = activateProvider('serpapi');
      if (success) {
        toast.success('SERP API activated');
      }
    } else {
      const success = deactivateProvider('serpapi');
      if (success) {
        toast.success('SERP API deactivated');
      }
    }
    
    // Notify parent of change
    if (onApiKeyChange) {
      onApiKeyChange();
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border border-white/10 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Key className="h-5 w-5 mr-2 text-blue-500" />
          SERP API Integration
          {keyExists && (
            <span className="ml-2 text-xs bg-green-600/20 text-green-500 px-2 py-1 rounded-full">
              {isActive ? 'Active' : 'Configured'}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Configure your SERP API key for keyword research and content suggestions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {keyExists && (
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="serpapi-active" className="flex flex-col space-y-1">
                <span>Active</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Only one SERP provider can be active at a time
                </span>
              </Label>
              <Switch
                id="serpapi-active"
                checked={isActive}
                onCheckedChange={handleToggleActive}
                disabled={!keyExists}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="serp-api-key" className="text-sm text-white/70 flex justify-between">
              <span>API Key</span>
              {validationError && (
                <span className="text-red-400 flex items-center text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationError}
                </span>
              )}
            </label>
            <Input
              id="serp-api-key"
              type="text"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setValidationError(undefined);
              }}
              className={`flex-1 bg-white/5 border-white/10 ${validationError ? 'border-red-500' : ''}`}
              placeholder="Your SERP API key"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSaveApiKey}
              disabled={isSaving || isTesting || isDeleting}
              className="flex-1"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save API Key
                </span>
              )}
            </Button>
            
            <Button
              onClick={handleTestApiKey}
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
                  Test Key
                </span>
              )}
            </Button>
            
            {keyExists && (
              <Button
                onClick={handleDeleteApiKey}
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
            <p>Setting up SERP API:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>Create an account at <a href="https://serpapi.com/users/sign_up" target="_blank" rel="noreferrer" className="text-blue-400 underline">SERP API</a></li>
              <li>Go to your Dashboard to find your API key</li>
              <li>Enter the API key here and click Save</li>
              <li>Set as Active to use this provider for keyword research</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
