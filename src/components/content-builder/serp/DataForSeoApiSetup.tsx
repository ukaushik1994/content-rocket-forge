
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Key } from "lucide-react";
import { toast } from "sonner";
import { isDataForSeoFormat, encodeDataForSeoCredentials } from '@/services/apiKeys/testing';

export interface DataForSeoApiSetupProps {
  onConfigured?: () => void;
}

export const DataForSeoApiSetup: React.FC<DataForSeoApiSetupProps> = ({ onConfigured }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isKeyVerified, setIsKeyVerified] = useState(false);
  
  // Check if keys exist
  useEffect(() => {
    const storedKey = localStorage.getItem('dataforseo_api_key');
    if (storedKey) {
      try {
        // Properly decode the credentials
        import('@/services/apiKeys/testing').then(module => {
          if (module.isDataForSeoFormat(storedKey)) {
            const decoded = module.decodeDataForSeoCredentials(storedKey);
            if (decoded) {
              setLogin(decoded.login || '');
              setPassword(decoded.password || '');
              setIsKeyVerified(true);
            }
          }
        });
      } catch (e) {
        // Invalid key format, ignore
        console.error('Error decoding stored DataForSEO credentials:', e);
      }
    }
  }, []);
  
  const handleSave = async () => {
    if (!login || !password) {
      toast.error('Please enter both login and password');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Encode the credentials properly as JSON
      const credentials = JSON.stringify({ login, password });
      const encodedCredentials = btoa(credentials);
      
      // Save to localStorage
      localStorage.setItem('dataforseo_api_key', encodedCredentials);
      
      // Test the connection
      try {
        const module = await import('@/services/serp/adapters/dataforseo/ApiKeyTester');
        const isValid = await module.testDataForSeoApiKey(encodedCredentials);
        
        if (isValid) {
          toast.success('DataForSEO API credentials verified successfully');
        } else {
          toast.warning('DataForSEO credentials saved but could not be verified. Please check your login and password.');
        }
      } catch (testError) {
        console.error('Error testing DataForSEO credentials:', testError);
      }
      
      setIsKeyVerified(true);
      
      // Notify parent component if needed
      if (onConfigured) {
        onConfigured();
      }
    } catch (error: any) {
      console.error('Error saving DataForSEO API credentials:', error);
      toast.error(error.message || 'Failed to save API credentials');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = () => {
    localStorage.removeItem('dataforseo_api_key');
    setLogin('');
    setPassword('');
    setIsKeyVerified(false);
    toast.success('DataForSEO API credentials removed');
  };
  
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">DataForSEO API Setup</CardTitle>
        <CardDescription>
          Connect your DataForSEO API to access SERP data and keyword insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login">API Login</Label>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="pl-10"
              placeholder="Your DataForSEO login"
              disabled={isSaving}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">API Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              placeholder="Your DataForSEO password"
              disabled={isSaving}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-white/5 p-3 rounded text-xs text-white/70 border border-white/10 mt-4">
          <p className="font-medium mb-1">DataForSEO Connection Instructions:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Enter your DataForSEO account login (email)</li>
            <li>Enter your DataForSEO account password</li>
            <li>Click Save to store and test your credentials</li>
          </ol>
          <p className="mt-2 italic">Note: You need an active DataForSEO account to use this feature.</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isKeyVerified ? (
          <>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving}
            >
              Remove API Key
            </Button>
            <Button 
              variant="default"
              onClick={handleSave}
              disabled={isSaving || !login || !password}
            >
              {isSaving ? "Saving..." : "Update"}
            </Button>
          </>
        ) : (
          <Button 
            className="w-full"
            onClick={handleSave}
            disabled={isSaving || !login || !password}
          >
            {isSaving ? "Saving..." : "Save API Key"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
