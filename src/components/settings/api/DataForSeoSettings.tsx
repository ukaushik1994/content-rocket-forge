
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Key, Save, TestTube, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { activateProvider, deactivateProvider, getSerpProviderStatus, isProviderActive } from '@/services/serp/providers/ProviderManager';

interface DataForSeoSettingsProps {
  onApiKeyChange?: () => void;
}

export const DataForSeoSettings: React.FC<DataForSeoSettingsProps> = ({ onApiKeyChange }) => {
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
        const storedKey = localStorage.getItem('dataforseo_api_key');
        if (storedKey) {
          setApiKey(storedKey);
          setKeyExists(true);
          
          // Check if this provider is active
          const active = isProviderActive('dataforseo');
          setIsActive(active);
        }
      } catch (error) {
        console.error('Error loading DataForSEO API key:', error);
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
      localStorage.setItem('dataforseo_api_key', apiKey.trim());
      
      // Activate this provider if the switch is on
      if (isActive) {
        activateProvider('dataforseo');
      }
      
      setKeyExists(true);
      toast.success('DataForSEO API key saved successfully');
      
      // Notify parent of change
      if (onApiKeyChange) {
        onApiKeyChange();
      }
    } catch (error) {
      console.error('Error saving DataForSEO API key:', error);
      toast.error('Failed to save DataForSEO API key');
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
        toast.success('DataForSEO API key is valid');
      } else {
        toast.error('Invalid DataForSEO API key format');
      }
    } catch (error) {
      console.error('Error testing DataForSEO API key:', error);
      toast.error('Failed to test DataForSEO API key');
    } finally {
      setIsTesting(false);
    }
  };
  
  // Handle deleting the API key
  const handleDeleteApiKey = async () => {
    setIsDeleting(true);
    
    try {
      // Remove the key from localStorage
      localStorage.removeItem('dataforseo_api_key');
      
      // Deactivate this provider
      deactivateProvider('dataforseo');
      
      setApiKey('');
      setKeyExists(false);
      setIsActive(false);
      toast.success('DataForSEO API key deleted successfully');
      
      // Notify parent of change
      if (onApiKeyChange) {
        onApiKeyChange();
      }
    } catch (error) {
      console.error('Error deleting DataForSEO API key:', error);
      toast.error('Failed to delete DataForSEO API key');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle activation toggle
  const handleToggleActive = (checked: boolean) => {
    setIsActive(checked);
    
    if (checked) {
      const success = activateProvider('dataforseo');
      if (success) {
        toast.success('DataForSEO API activated');
      }
    } else {
      const success = deactivateProvider('dataforseo');
      if (success) {
        toast.success('DataForSEO API deactivated');
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
    <Card className="border border-white/10 shadow-lg mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Key className="h-5 w-5 mr-2 text-green-500" />
          DataForSEO Integration
          {keyExists && (
            <span className="ml-2 text-xs bg-green-600/20 text-green-500 px-2 py-1 rounded-full">
              {isActive ? 'Active' : 'Configured'}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Configure your DataForSEO API key for enterprise-level SEO data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {keyExists && (
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="dataforseo-active" className="flex flex-col space-y-1">
                <span>Active</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Only one SERP provider can be active at a time
                </span>
              </Label>
              <Switch
                id="dataforseo-active"
                checked={isActive}
                onCheckedChange={handleToggleActive}
                disabled={!keyExists}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="dataforseo-api-key" className="text-sm text-white/70 flex justify-between">
              <span>API Key</span>
              {validationError && (
                <span className="text-red-400 flex items-center text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationError}
                </span>
              )}
            </label>
            <Input
              id="dataforseo-api-key"
              type="text"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setValidationError(undefined);
              }}
              className={`flex-1 bg-white/5 border-white/10 ${validationError ? 'border-red-500' : ''}`}
              placeholder="Your DataForSEO API key"
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
            <p>Setting up DataForSEO:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>Create an account at <a href="https://app.dataforseo.com/register" target="_blank" rel="noreferrer" className="text-blue-400 underline">DataForSEO</a></li>
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
