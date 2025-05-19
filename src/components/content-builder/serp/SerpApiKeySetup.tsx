
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Key, Save, Check, AlertCircle, Loader2, TestTube } from "lucide-react";
import { testApiKey } from '@/services/apiKeys/testing';

interface SerpApiKeySetupProps {
  onConfigured?: () => void;
}

export const SerpApiKeySetup: React.FC<SerpApiKeySetupProps> = ({ onConfigured }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>(undefined);

  // Check for existing API key on component mount
  useEffect(() => {
    const existingKey = localStorage.getItem('serp_api_key');
    if (existingKey) {
      setHasExistingKey(true);
      setApiKey(existingKey);
    }
  }, []);

  // Validate the API key
  const validateApiKey = (): boolean => {
    if (!apiKey.trim()) {
      setValidationError('API key is required');
      return false;
    }
    
    setValidationError(undefined);
    return true;
  };

  // Handle saving the API key
  const handleSaveApiKey = async () => {
    if (!validateApiKey()) {
      return;
    }

    setIsSaving(true);

    try {
      localStorage.setItem('serp_api_key', apiKey.trim());
      
      setIsSuccess(true);
      setHasExistingKey(true);
      toast.success("SERP API key saved successfully!");
      
      // Notify parent component
      onConfigured?.();
      
      // Reset the success state after a delay
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving SERP API key:', error);
      toast.error("Failed to save API key");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle testing the API key
  const handleTestConnection = async () => {
    if (!validateApiKey()) {
      return;
    }
    
    setIsTesting(true);
    
    try {
      // Test the API key
      const success = await testApiKey('serp', apiKey.trim());
      
      if (success) {
        toast.success("Successfully connected to SERP API!");
        // Save the API key if test is successful
        localStorage.setItem('serp_api_key', apiKey.trim());
        setHasExistingKey(true);
        
        // Notify parent component
        onConfigured?.();
      } else {
        toast.error("Failed to connect to SERP API. Please check your API key.");
      }
    } catch (error: any) {
      console.error('Error testing SERP API connection:', error);
      toast.error(error.message || "Failed to test connection");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="border border-white/10 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Key className="h-5 w-5 mr-2 text-blue-500" />
          SERP API Setup
          {hasExistingKey && (
            <span className="ml-2 text-xs bg-green-600/20 text-green-500 px-2 py-1 rounded-full">
              Configured
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Enter your SERP API key to get search engine results data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
              disabled={isSaving || isTesting || isSuccess}
              className={`flex-1 ${isSuccess ? "bg-green-600" : ""}`}
            >
              {isSaving ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
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
            
            <Button
              onClick={handleTestConnection}
              disabled={isSaving || isTesting || isSuccess}
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
                  Test Connection
                </span>
              )}
            </Button>
          </div>
          
          <div className="bg-white/5 p-3 rounded text-xs text-white/70 border border-white/10">
            <p>Setting up SERP API:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>Create an account at <a href="https://serpapi.com/users/sign_up" target="_blank" rel="noreferrer" className="text-blue-400 underline">SERP API</a></li>
              <li>Go to your Dashboard to find your API key</li>
              <li>Enter the API key here</li>
              <li>Click "Test Connection" to verify your key</li>
              <li>Your API key is stored locally for security</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
