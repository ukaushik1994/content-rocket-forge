
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Key, Save, Check, RefreshCw } from "lucide-react";

export const SerpApiKeySetup: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [existingKey, setExistingKey] = useState<string | null>(null);

  // Check for existing API key on component mount
  useEffect(() => {
    const storedKey = localStorage.getItem('serp_api_key');
    if (storedKey) {
      // Only show a few characters of the key for security
      const maskedKey = storedKey.substring(0, 4) + '••••••••••••' + 
        (storedKey.length > 16 ? storedKey.substring(storedKey.length - 4) : '');
      setExistingKey(maskedKey);
      setIsSuccess(true);
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    setIsSaving(true);

    try {
      // Test the key first
      setIsTesting(true);
      
      try {
        // Simple test request to see if the key works
        const response = await fetch(`https://api.serphouse.com/serp/test`, {
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API key test failed: ${response.status}`);
        }
        
        // Test succeeded
        console.log("SERP API key test succeeded");
      } catch (testError) {
        console.warn("SERP API key test failed:", testError);
        // We'll still save the key, but warn the user
        toast.warning("API key accepted, but test request failed. It might not work with the API.");
      } finally {
        setIsTesting(false);
      }
      
      // Store the API key in localStorage
      localStorage.setItem('serp_api_key', apiKey.trim());
      
      setIsSuccess(true);
      toast.success("SERP API key saved successfully!");
      
      // Set the masked key
      const maskedKey = apiKey.substring(0, 4) + '••••••••••••' + 
        (apiKey.length > 16 ? apiKey.substring(apiKey.length - 4) : '');
      setExistingKey(maskedKey);
      
      // Reset the form after success
      setTimeout(() => {
        // Reload the page to reflect the changes
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error("Failed to save API key");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveKey = () => {
    if (confirm("Are you sure you want to remove your API key?")) {
      localStorage.removeItem('serp_api_key');
      setExistingKey(null);
      setIsSuccess(false);
      setApiKey('');
      toast.success("API key removed successfully");
    }
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

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
        {existingKey ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-md">
              <p className="text-sm font-medium text-green-300 flex items-center">
                <Check className="h-4 w-4 mr-2" />
                API Key is configured
              </p>
              <p className="text-xs text-white/70 mt-1">Current key: {existingKey}</p>
            </div>
            <div className="flex items-center gap-2">
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
                  onChange={(e) => setApiKey(e.target.value)}
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
              <p className="text-xs text-white/50 mt-1">
                Your API key will be stored locally on your device.
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
