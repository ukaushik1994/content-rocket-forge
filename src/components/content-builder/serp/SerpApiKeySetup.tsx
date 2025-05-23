
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Key, Save, Check, RefreshCw, AlertTriangle } from "lucide-react";
import { saveApiKey, getApiKey, testApiKey, deleteApiKey } from '@/services/apiKeyService';

export const SerpApiKeySetup: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [existingKey, setExistingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  // Check for existing API key on component mount
  useEffect(() => {
    const checkExistingKey = async () => {
      try {
        setIsLoading(true);
        const storedKey = await getApiKey('serp');
        if (storedKey) {
          // Only show a few characters of the key for security
          const maskedKey = storedKey.substring(0, 4) + '••••••••••••' + 
            (storedKey.length > 16 ? storedKey.substring(storedKey.length - 4) : '');
          setExistingKey(maskedKey);
          setIsSuccess(true);
        }
      } catch (error) {
        console.warn('Error checking existing API key:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkExistingKey();
  }, []);

  const handleTestKey = async (keyToTest: string) => {
    setIsTesting(true);
    setError(null);
    setTestResult(null);
    
    try {
      const success = await testApiKey('serp', keyToTest);
      
      if (success) {
        setTestResult({
          success: true,
          message: 'API key tested successfully!'
        });
        return true;
      } else {
        setTestResult({
          success: false,
          message: 'API key test failed. Please check your key.'
        });
        return false;
      }
    } catch (error: any) {
      console.error('API test error:', error);
      setTestResult({
        success: false,
        message: `API test failed: ${error.message || 'Unknown error'}`
      });
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Test the key first
      const isValid = await handleTestKey(apiKey);
      
      // Save the key regardless of test result (with appropriate messaging)
      const saveSuccess = await saveApiKey('serp', apiKey.trim());
      
      if (saveSuccess) {
        setIsSuccess(true);
        
        if (isValid) {
          toast.success("SERP API key saved and verified successfully!");
        } else {
          toast.warning("API key saved but could not be verified. It might not work properly.");
        }
        
        // Set the masked key
        const maskedKey = apiKey.substring(0, 4) + '••••••••••••' + 
          (apiKey.length > 16 ? apiKey.substring(apiKey.length - 4) : '');
        setExistingKey(maskedKey);
        
        // Reset the form after success
        setTimeout(() => {
          // Reload the page to reflect the changes
          window.location.reload();
        }, 1500);
      } else {
        throw new Error('Failed to save API key');
      }
    } catch (error: any) {
      console.error('Error saving API key:', error);
      setError(error.message || "Failed to save API key");
      toast.error("Failed to save API key. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveKey = async () => {
    if (confirm("Are you sure you want to remove your API key?")) {
      try {
        const success = await deleteApiKey('serp');
        
        if (success) {
          setExistingKey(null);
          setIsSuccess(false);
          setApiKey('');
          setError(null);
          setTestResult(null);
          toast.success("API key removed successfully");
        }
      } catch (error) {
        console.error('Error removing API key:', error);
        toast.error("Failed to remove API key");
      }
    }
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const handleTestExistingKey = async () => {
    try {
      const storedKey = await getApiKey('serp');
      if (storedKey) {
        await handleTestKey(storedKey);
      } else {
        toast.error("No API key found to test");
      }
    } catch (error) {
      console.error('Error testing existing key:', error);
      toast.error("Failed to test API key");
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-white/10 shadow-lg">
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading API key status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-white/10 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Key className="h-5 w-5 mr-2 text-neon-purple" />
          SERP API Key Setup
        </CardTitle>
        <CardDescription>
          Enter your SERP API key to get real search data instead of mock data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-md mb-4">
            <p className="text-sm font-medium text-red-300 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {error}
            </p>
          </div>
        )}
        
        {testResult && (
          <div className={`p-4 ${testResult.success ? 'bg-green-900/20 border border-green-500/30' : 'bg-yellow-900/20 border border-yellow-500/30'} rounded-md mb-4`}>
            <p className={`text-sm font-medium ${testResult.success ? 'text-green-300' : 'text-yellow-300'} flex items-center`}>
              {testResult.success ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              {testResult.message}
            </p>
          </div>
        )}
        
        {existingKey ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-md">
              <p className="text-sm font-medium text-green-300 flex items-center">
                <Check className="h-4 w-4 mr-2" />
                API Key is configured
              </p>
              <p className="text-xs text-white/70 mt-1">Current key: {existingKey}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveKey}
                className="text-xs"
              >
                Remove Key
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestExistingKey}
                disabled={isTesting}
                className="text-xs flex items-center gap-1"
              >
                {isTesting ? 'Testing...' : 'Test Key'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshPage}
                className="text-xs flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh Page
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm text-white/70">
                API Key
              </label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setError(null);
                    setTestResult(null);
                  }}
                  className="flex-1 bg-white/5 border-white/10"
                  placeholder="Enter your SERP API key"
                />
                <Button
                  onClick={handleSaveApiKey}
                  disabled={isSaving || isTesting || !apiKey.trim() || isSuccess}
                  className={isSuccess ? "bg-green-600" : ""}
                >
                  {isSaving || isTesting ? (
                    <span className="flex items-center">
                      <Save className="h-4 w-4 mr-2 animate-pulse" />
                      {isTesting ? 'Testing...' : 'Saving...'}
                    </span>
                  ) : isSuccess ? (
                    <span className="flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Saved!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      Save API Key
                    </span>
                  )}
                </Button>
              </div>
              <div className="flex justify-end mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTestKey(apiKey)}
                  disabled={isTesting || !apiKey.trim()}
                  className="h-7 text-xs"
                >
                  {isTesting ? 'Testing...' : 'Test before saving'}
                </Button>
              </div>
              <p className="text-xs text-white/50 mt-1">
                Your API key will be stored securely in the database.
              </p>
            </div>
            <div className="bg-white/5 p-3 rounded text-xs text-white/70 border border-white/10">
              <p>Don&apos;t have a SERP API key?</p>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                <li>Sign up at a SERP API provider</li>
                <li>Go to your account settings and generate an API key</li>
                <li>Copy the API key and paste it here</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
