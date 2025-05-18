
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { Key, Save, Check } from "lucide-react";

export const SerpApiKeySetup: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    setIsSaving(true);

    try {
      // Store the API key in localStorage (in a real app, you might want to encrypt this)
      localStorage.setItem('serp_api_key', apiKey.trim());
      
      setIsSuccess(true);
      toast.success("SERP API key saved successfully!");
      
      // Reset the form after success
      setTimeout(() => {
        setIsSuccess(false);
        // Optional: Redirect to content builder or reload the page
        router.reload();
      }, 2000);
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error("Failed to save API key");
    } finally {
      setIsSaving(false);
    }
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
                disabled={isSaving || !apiKey.trim() || isSuccess}
                className={isSuccess ? "bg-green-600" : ""}
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <Save className="h-4 w-4 mr-2 animate-pulse" />
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
      </CardContent>
    </Card>
  );
};
