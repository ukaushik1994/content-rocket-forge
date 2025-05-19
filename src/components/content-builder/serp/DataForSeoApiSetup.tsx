
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Key, Save, Check, AlertCircle, Loader2, TestTube } from "lucide-react";
import { testApiKey } from '@/services/apiKeys/testing';
import { encodeDataForSeoCredentials } from '@/services/apiKeys/validation';

interface DataForSeoApiSetupProps {
  onConfigured?: () => void;
}

export const DataForSeoApiSetup: React.FC<DataForSeoApiSetupProps> = ({ onConfigured }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasExistingCredentials, setHasExistingCredentials] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>(undefined);

  // Check for existing API key on component mount
  useEffect(() => {
    const existingKey = localStorage.getItem('dataforseo_api_key');
    if (existingKey) {
      setHasExistingCredentials(true);
      try {
        // Try to decode the base64 string
        const decoded = atob(existingKey);
        const [storedEmail, storedPassword] = decoded.split(':');
        if (storedEmail && storedPassword) {
          setEmail(storedEmail);
          setPassword(storedPassword);
        }
      } catch (error) {
        console.error('Error decoding existing DataForSEO credentials:', error);
      }
    }
  }, []);

  // Validate the credentials
  const validateCredentials = (): boolean => {
    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }
    
    if (!password.trim()) {
      setValidationError('Password is required');
      return false;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    
    setValidationError(undefined);
    return true;
  };

  // Handle saving the credentials
  const handleSaveCredentials = async () => {
    if (!validateCredentials()) {
      return;
    }

    setIsSaving(true);

    try {
      const encodedCredentials = encodeDataForSeoCredentials(email, password);
      localStorage.setItem('dataforseo_api_key', encodedCredentials);
      
      setIsSuccess(true);
      setHasExistingCredentials(true);
      toast.success("DataForSEO credentials saved successfully!");
      
      // Notify parent component
      onConfigured?.();
      
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
  
  // Handle testing the credentials
  const handleTestConnection = async () => {
    if (!validateCredentials()) {
      return;
    }
    
    setIsTesting(true);
    
    try {
      // Encode the credentials
      const encodedCredentials = encodeDataForSeoCredentials(email, password);
      
      // Test the credentials
      const success = await testApiKey('dataforseo', encodedCredentials);
      
      if (success) {
        toast.success("Successfully connected to DataForSEO!");
        // Save the credentials if test is successful
        localStorage.setItem('dataforseo_api_key', encodedCredentials);
        setHasExistingCredentials(true);
        
        // Notify parent component
        onConfigured?.();
      } else {
        toast.error("Failed to connect to DataForSEO. Please check your credentials.");
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
          <Key className="h-5 w-5 mr-2 text-blue-500" />
          DataForSEO Setup
          {hasExistingCredentials && (
            <span className="ml-2 text-xs bg-green-600/20 text-green-500 px-2 py-1 rounded-full">
              Configured
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Enter your DataForSEO email and password to access search engine data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="dataforseo-email" className="text-sm text-white/70 flex justify-between">
              <span>Email</span>
              {validationError && validationError.includes('email') && (
                <span className="text-red-400 flex items-center text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationError}
                </span>
              )}
            </label>
            <Input
              id="dataforseo-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setValidationError(undefined);
              }}
              className={`flex-1 bg-white/5 border-white/10 ${validationError && validationError.includes('email') ? 'border-red-500' : ''}`}
              placeholder="Your DataForSEO email"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="dataforseo-password" className="text-sm text-white/70 flex justify-between">
              <span>Password</span>
              {validationError && validationError.includes('password') && (
                <span className="text-red-400 flex items-center text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationError}
                </span>
              )}
            </label>
            <Input
              id="dataforseo-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setValidationError(undefined);
              }}
              className={`flex-1 bg-white/5 border-white/10 ${validationError && validationError.includes('password') ? 'border-red-500' : ''}`}
              placeholder="Your DataForSEO password"
            />
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
              <li>Create an account at <a href="https://dataforseo.com/" target="_blank" rel="noreferrer" className="text-blue-400 underline">DataForSEO</a></li>
              <li>Enter your DataForSEO account email and password</li>
              <li>Click "Test Connection" to verify your credentials</li>
              <li>Your credentials are stored locally for security</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
