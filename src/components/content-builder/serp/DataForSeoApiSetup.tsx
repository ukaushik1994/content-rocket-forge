
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Key, Save, Check, AlertCircle, Loader2, TestTube } from "lucide-react";
import { testApiKey } from '@/services/apiKeys/testing';

export const DataForSeoApiSetup: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasExistingCredentials, setHasExistingCredentials] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    login?: string;
    password?: string;
  }>({});

  // Check for existing credentials on component mount
  useEffect(() => {
    const existingCredentials = localStorage.getItem('dataforseo_api_key');
    if (existingCredentials) {
      setHasExistingCredentials(true);
      
      // Try to decode and get login
      try {
        const decoded = atob(existingCredentials);
        const [savedLogin] = decoded.split(':');
        if (savedLogin) {
          setLogin(savedLogin);
        }
      } catch (error) {
        console.error('Error decoding DataForSEO credentials:', error);
      }
    }
  }, []);

  // Validate input fields
  const validateFields = (): boolean => {
    const errors: {login?: string; password?: string;} = {};
    
    if (!login.trim()) {
      errors.login = 'Login is required';
    } else if (!login.includes('@')) {
      errors.login = 'Login should be a valid email address';
    }
    
    if (!password.trim()) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle saving credentials
  const handleSaveCredentials = async () => {
    if (!validateFields()) {
      return;
    }

    setIsSaving(true);

    try {
      // For DataForSEO, we store the base64 encoded credentials
      const credentials = btoa(`${login.trim()}:${password.trim()}`);
      localStorage.setItem('dataforseo_api_key', credentials);
      
      setIsSuccess(true);
      setHasExistingCredentials(true);
      toast.success("DataForSEO credentials saved successfully!");
      
      // Reset the success state after a delay
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving DataForSEO credentials:', error);
      toast.error("Failed to save credentials");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle testing connection
  const handleTestConnection = async () => {
    if (!validateFields()) {
      return;
    }
    
    setIsTesting(true);
    
    try {
      // Create the base64 credentials
      const credentials = btoa(`${login.trim()}:${password.trim()}`);
      
      // Test the API key
      const success = await testApiKey('dataforseo', credentials);
      
      if (success) {
        toast.success("Successfully connected to DataForSEO API!");
        // Save the credentials if test is successful
        localStorage.setItem('dataforseo_api_key', credentials);
        setHasExistingCredentials(true);
      } else {
        toast.error("Failed to connect to DataForSEO API. Please check your credentials.");
      }
    } catch (error: any) {
      console.error('Error testing DataForSEO connection:', error);
      toast.error(error.message || "Failed to test connection");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="border border-white/10 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Key className="h-5 w-5 mr-2 text-green-500" />
          DataForSEO API Setup
          {hasExistingCredentials && (
            <span className="ml-2 text-xs bg-green-600/20 text-green-500 px-2 py-1 rounded-full">
              Configured
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Enter your DataForSEO API credentials to get professional SEO data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="api-login" className="text-sm text-white/70 flex justify-between">
              <span>Login (Email)</span>
              {validationErrors.login && (
                <span className="text-red-400 flex items-center text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.login}
                </span>
              )}
            </label>
            <Input
              id="api-login"
              type="email"
              value={login}
              onChange={(e) => {
                setLogin(e.target.value);
                setValidationErrors(prev => ({...prev, login: undefined}));
              }}
              className={`flex-1 bg-white/5 border-white/10 ${validationErrors.login ? 'border-red-500' : ''}`}
              placeholder="user@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="api-password" className="text-sm text-white/70 flex justify-between">
              <span>Password</span>
              {validationErrors.password && (
                <span className="text-red-400 flex items-center text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.password}
                </span>
              )}
            </label>
            <Input
              id="api-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setValidationErrors(prev => ({...prev, password: undefined}));
              }}
              className={`flex-1 bg-white/5 border-white/10 ${validationErrors.password ? 'border-red-500' : ''}`}
              placeholder="Your API password"
            />
            <p className="text-xs text-gray-400 mt-1">
              If you don't see your password, you can request it from the DataForSEO dashboard.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSaveCredentials}
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
                  Save Credentials
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
            <p>Setting up DataForSEO:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>Create an account at <a href="https://app.dataforseo.com/register" target="_blank" rel="noreferrer" className="text-blue-400 underline">DataForSEO</a></li>
              <li>Go to API Dashboard to find your credentials</li>
              <li>Enter the login (email) and password here</li>
              <li>Click "Test Connection" to verify your credentials</li>
              <li>Your credentials are stored locally for security</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
