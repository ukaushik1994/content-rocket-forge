
/**
 * DataForSEO specific credential card component
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ApiCredentialProps } from './types';
import { ApiCredentialActions } from './ApiCredentialActions';
import { getApiKey, deleteApiKey } from "@/services/apiKeys/storage";
import { testApiKey } from '@/services/apiKeys/testing';
import { encodeDataForSeoCredentials, decodeDataForSeoCredentials } from '@/services/apiKeys/validation';
import { AlertCircle, Check } from "lucide-react";

export const DataForSeoCredentialCard: React.FC<ApiCredentialProps> = ({
  provider,
  onSave,
  onTest,
  onDelete,
  className = '',
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>(undefined);
  const [isValid, setIsValid] = useState(false);
  const [hasExistingCredentials, setHasExistingCredentials] = useState(false);
  
  // Load existing credentials on mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const encodedCredentials = await getApiKey('dataforseo');
        
        if (encodedCredentials) {
          setHasExistingCredentials(true);
          setIsValid(true);
          
          try {
            // Try to decode the base64 string
            const { email: storedEmail, password: storedPassword } = decodeDataForSeoCredentials(encodedCredentials);
            if (storedEmail && storedPassword) {
              setEmail(storedEmail);
              setPassword(storedPassword);
            }
          } catch (error) {
            console.error('Error decoding existing DataForSEO credentials:', error);
          }
        }
      } catch (error) {
        console.error('Error loading DataForSEO credentials:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCredentials();
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
  
  // Handle testing the credentials
  const handleTestCredentials = async () => {
    if (!validateCredentials()) {
      return;
    }
    
    setIsTesting(true);
    
    try {
      // Encode the credentials
      const encodedCredentials = encodeDataForSeoCredentials(email, password);
      
      // Test the credentials
      const isValidKey = onTest
        ? await onTest(encodedCredentials)
        : await testApiKey('dataforseo', encodedCredentials);
      
      if (isValidKey) {
        toast.success("Successfully connected to DataForSEO!");
        setIsValid(true);
      } else {
        toast.error("Failed to connect to DataForSEO. Please check your credentials.");
        setIsValid(false);
      }
    } catch (error: any) {
      console.error('Error testing DataForSEO connection:', error);
      toast.error(error.message || "Failed to test connection");
      setIsValid(false);
    } finally {
      setIsTesting(false);
    }
  };
  
  // Handle saving the credentials
  const handleSaveCredentials = async () => {
    if (!validateCredentials()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const encodedCredentials = encodeDataForSeoCredentials(email, password);
      
      const success = onSave
        ? await onSave(encodedCredentials)
        : await deleteApiKey('dataforseo'); // Default behavior is to delete first
      
      if (success) {
        setHasExistingCredentials(true);
        setIsValid(true);
        toast.success("DataForSEO credentials saved successfully!");
      } else {
        toast.error("Failed to save credentials");
      }
    } catch (error: any) {
      console.error('Error saving DataForSEO credentials:', error);
      toast.error(error.message || "Failed to save credentials");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle deleting the credentials
  const handleDeleteCredentials = async () => {
    setIsSaving(true);
    
    try {
      const success = onDelete
        ? await onDelete()
        : await deleteApiKey('dataforseo');
      
      if (success) {
        setEmail('');
        setPassword('');
        setHasExistingCredentials(false);
        setIsValid(false);
        toast.success("DataForSEO credentials deleted successfully");
      } else {
        toast.error("Failed to delete credentials");
      }
    } catch (error: any) {
      console.error('Error deleting DataForSEO credentials:', error);
      toast.error(error.message || "Failed to delete credentials");
    } finally {
      setIsSaving(false);
      setIsDeleteConfirmOpen(false);
    }
  };
  
  return (
    <Card className={`border border-white/10 shadow-lg ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          DataForSEO
          {isValid && (
            <span className="text-xs bg-green-600/20 text-green-500 px-2 py-1 rounded-full">
              Configured
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Enterprise SEO data platform
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dataforseo-email" className="text-sm text-white/70 flex justify-between">
              <span>Email</span>
              {validationError && validationError.includes('email') && (
                <span className="text-red-400 flex items-center text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationError}
                </span>
              )}
              {isValid && !validationError && (
                <span className="text-green-400 flex items-center text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Valid
                </span>
              )}
            </Label>
            <Input
              id="dataforseo-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setValidationError(undefined);
                setIsValid(false);
              }}
              disabled={isLoading}
              className={`flex-1 bg-white/5 border-white/10 ${validationError && validationError.includes('email') ? 'border-red-500' : ''}`}
              placeholder="Your DataForSEO email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dataforseo-password" className="text-sm text-white/70 flex justify-between">
              <span>Password</span>
              {validationError && validationError.includes('password') && (
                <span className="text-red-400 flex items-center text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationError}
                </span>
              )}
            </Label>
            <Input
              id="dataforseo-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setValidationError(undefined);
                setIsValid(false);
              }}
              disabled={isLoading}
              className={`flex-1 bg-white/5 border-white/10 ${validationError && validationError.includes('password') ? 'border-red-500' : ''}`}
              placeholder="Your DataForSEO password"
            />
          </div>
          
          <ApiCredentialActions
            onSave={handleSaveCredentials}
            onDelete={() => setIsDeleteConfirmOpen(true)}
            onTest={handleTestCredentials}
            isSaving={isSaving}
            isTesting={isTesting}
            isTestable={true}
            isValid={isValid}
            hasKey={hasExistingCredentials}
          />
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="bg-white/5 p-3 rounded text-xs text-white/70 border border-white/10">
          <p>Setting up DataForSEO:</p>
          <ul className="list-disc pl-4 mt-1 space-y-1">
            <li>Create an account at <a href="https://dataforseo.com/" target="_blank" rel="noreferrer" className="text-blue-400 underline">DataForSEO</a></li>
            <li>Enter your DataForSEO account email and password</li>
            <li>Click "Test Connection" to verify your credentials</li>
            <li>Your credentials are stored securely for API access</li>
          </ul>
        </div>
      </CardFooter>
      
      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete DataForSEO Credentials</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your DataForSEO credentials? 
              This will remove them from your account and you'll need to enter them again to use DataForSEO features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCredentials} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
