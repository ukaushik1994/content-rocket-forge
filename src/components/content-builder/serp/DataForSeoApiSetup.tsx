
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Key } from "lucide-react";
import { toast } from "sonner";

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
        const decoded = JSON.parse(atob(storedKey));
        setLogin(decoded.login || '');
        setPassword(decoded.password || '');
        setIsKeyVerified(true);
      } catch (e) {
        // Invalid key format, ignore
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
      // Encode the credentials as base64
      const credentials = btoa(JSON.stringify({ login, password }));
      
      // Save to localStorage
      localStorage.setItem('dataforseo_api_key', credentials);
      
      toast.success('DataForSEO API credentials saved successfully');
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
              Update
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
