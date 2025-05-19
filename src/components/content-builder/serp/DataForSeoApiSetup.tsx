
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Key, Save, Check } from "lucide-react";

export const DataForSeoApiSetup: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSaveCredentials = () => {
    if (!login.trim() || !password.trim()) {
      toast.error("Please enter both your DataForSEO login and password");
      return;
    }

    setIsSaving(true);

    try {
      // For DataForSEO, we store the base64 encoded credentials
      const credentials = btoa(`${login.trim()}:${password.trim()}`);
      localStorage.setItem('dataforseo_api_key', credentials);
      
      setIsSuccess(true);
      toast.success("DataForSEO credentials saved successfully!");
      
      // Reset the form after success
      setTimeout(() => {
        setIsSuccess(false);
        // Reload the page to reflect the changes
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error saving DataForSEO credentials:', error);
      toast.error("Failed to save credentials");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border border-white/10 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Key className="h-5 w-5 mr-2 text-green-500" />
          DataForSEO API Setup
        </CardTitle>
        <CardDescription>
          Enter your DataForSEO API credentials to get professional SEO data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="api-login" className="text-sm text-white/70">
              Login
            </label>
            <Input
              id="api-login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="flex-1 bg-white/5 border-white/10"
              placeholder="Your DataForSEO login"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="api-password" className="text-sm text-white/70">
              Password
            </label>
            <Input
              id="api-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-white/5 border-white/10"
              placeholder="Your DataForSEO password"
            />
          </div>
          
          <Button
            onClick={handleSaveCredentials}
            disabled={isSaving || !login.trim() || !password.trim() || isSuccess}
            className={`w-full ${isSuccess ? "bg-green-600" : ""}`}
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
                Save Credentials
              </span>
            )}
          </Button>
          
          <div className="bg-white/5 p-3 rounded text-xs text-white/70 border border-white/10">
            <p>Setting up DataForSEO:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>Create an account at <a href="https://app.dataforseo.com/register" target="_blank" rel="noreferrer" className="text-blue-400 underline">DataForSEO</a></li>
              <li>Go to API Dashboard to find your credentials</li>
              <li>Enter the login and password here</li>
              <li>Your credentials are stored locally for security</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
