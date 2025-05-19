
/**
 * Reusable card component for API credentials
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ApiCredentialProps, ApiKeyState } from './types';
import { ApiCredentialInput } from './ApiCredentialInput';
import { ApiCredentialActions } from './ApiCredentialActions';
import { getApiKey, deleteApiKey } from "@/services/apiKeys/storage";
import { testApiKey } from '@/services/apiKeys/testing';

export const ApiCredentialCard: React.FC<ApiCredentialProps> = ({
  provider,
  onSave,
  onTest,
  onDelete,
  className = '',
}) => {
  const [state, setState] = useState<ApiKeyState>({
    key: '',
    isLoading: true,
    isTesting: false,
    isSaving: false,
    isDeleteConfirmOpen: false,
    hasError: false,
    errorMessage: undefined,
    isValid: false,
  });
  
  // Load existing API key on mount
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const apiKey = await getApiKey(provider.id);
        
        setState(prev => ({
          ...prev,
          key: apiKey || '',
          isLoading: false,
          hasError: false,
          isValid: !!apiKey
        }));
      } catch (error) {
        console.error(`Error loading ${provider.name} API key:`, error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasError: true,
          errorMessage: 'Failed to load API key'
        }));
      }
    };
    
    loadApiKey();
  }, [provider.id, provider.name]);
  
  // Handle input change
  const handleKeyChange = (value: string) => {
    setState(prev => ({
      ...prev,
      key: value,
      hasError: false,
      errorMessage: undefined,
      isValid: false
    }));
  };
  
  // Handle testing the API key
  const handleTestKey = async () => {
    if (!state.key) {
      setState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: 'API key is required'
      }));
      return;
    }
    
    setState(prev => ({ ...prev, isTesting: true }));
    
    try {
      const isValid = onTest
        ? await onTest(state.key)
        : await testApiKey(provider.id, state.key);
      
      if (isValid) {
        toast.success(`Successfully validated ${provider.name} API key`);
        setState(prev => ({
          ...prev,
          isTesting: false,
          isValid: true,
          hasError: false,
          errorMessage: undefined
        }));
      } else {
        toast.error(`Invalid ${provider.name} API key`);
        setState(prev => ({
          ...prev,
          isTesting: false,
          isValid: false,
          hasError: true,
          errorMessage: 'Invalid API key'
        }));
      }
    } catch (error: any) {
      console.error(`Error testing ${provider.name} API key:`, error);
      toast.error(error.message || `Failed to test ${provider.name} API key`);
      setState(prev => ({
        ...prev,
        isTesting: false,
        isValid: false,
        hasError: true,
        errorMessage: error.message || 'Failed to test API key'
      }));
    }
  };
  
  // Handle saving the API key
  const handleSaveKey = async () => {
    if (!state.key) {
      setState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: 'API key is required'
      }));
      return;
    }
    
    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      const success = onSave
        ? await onSave(state.key)
        : await deleteApiKey(provider.id); // Default behavior is to delete and add
      
      if (success) {
        toast.success(`${provider.name} API key saved successfully`);
        setState(prev => ({
          ...prev,
          isSaving: false,
          isValid: true,
          hasError: false,
          errorMessage: undefined
        }));
      } else {
        toast.error(`Failed to save ${provider.name} API key`);
        setState(prev => ({
          ...prev,
          isSaving: false,
          hasError: true,
          errorMessage: 'Failed to save API key'
        }));
      }
    } catch (error: any) {
      console.error(`Error saving ${provider.name} API key:`, error);
      toast.error(error.message || `Failed to save ${provider.name} API key`);
      setState(prev => ({
        ...prev,
        isSaving: false,
        hasError: true,
        errorMessage: error.message || 'Failed to save API key'
      }));
    }
  };
  
  // Handle deleting the API key
  const handleDeleteKey = async () => {
    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      const success = onDelete
        ? await onDelete()
        : await deleteApiKey(provider.id);
      
      if (success) {
        toast.success(`${provider.name} API key deleted successfully`);
        setState(prev => ({
          ...prev,
          key: '',
          isSaving: false,
          isValid: false,
          hasError: false,
          errorMessage: undefined,
          isDeleteConfirmOpen: false
        }));
      } else {
        toast.error(`Failed to delete ${provider.name} API key`);
        setState(prev => ({
          ...prev,
          isSaving: false,
          hasError: true,
          errorMessage: 'Failed to delete API key',
          isDeleteConfirmOpen: false
        }));
      }
    } catch (error: any) {
      console.error(`Error deleting ${provider.name} API key:`, error);
      toast.error(error.message || `Failed to delete ${provider.name} API key`);
      setState(prev => ({
        ...prev,
        isSaving: false,
        hasError: true,
        errorMessage: error.message || 'Failed to delete API key',
        isDeleteConfirmOpen: false
      }));
    }
  };
  
  return (
    <Card className={`border border-white/10 shadow-lg ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          {provider.name}
          {state.isValid && (
            <span className="text-xs bg-green-600/20 text-green-500 px-2 py-1 rounded-full">
              Configured
            </span>
          )}
          {provider.required && !state.isValid && (
            <span className="text-xs bg-amber-600/20 text-amber-500 px-2 py-1 rounded-full">
              Required
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {provider.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <ApiCredentialInput
          value={state.key}
          onChange={handleKeyChange}
          error={state.hasError ? state.errorMessage : undefined}
          loading={state.isLoading}
          placeholder={`Enter your ${provider.name} API key`}
          testable={true}
          onTest={handleTestKey}
          isTesting={state.isTesting}
          isValid={state.isValid}
        />
        
        <ApiCredentialActions
          onSave={handleSaveKey}
          onDelete={() => setState(prev => ({ ...prev, isDeleteConfirmOpen: true }))}
          onTest={handleTestKey}
          isSaving={state.isSaving}
          isTesting={state.isTesting}
          isTestable={true}
          isValid={state.isValid}
          hasKey={!!state.key}
        />
      </CardContent>
      
      {provider.docsUrl && (
        <CardFooter className="pt-0">
          <div className="text-xs text-white/70">
            <span>Need help? </span>
            <a 
              href={provider.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 underline"
            >
              View documentation
            </a>
            {provider.signupUrl && (
              <>
                <span> or </span>
                <a 
                  href={provider.signupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 underline"
                >
                  sign up for an account
                </a>
              </>
            )}
          </div>
        </CardFooter>
      )}
      
      <AlertDialog
        open={state.isDeleteConfirmOpen}
        onOpenChange={(open) => setState(prev => ({ ...prev, isDeleteConfirmOpen: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your {provider.name} API key? 
              This will remove it from your account and you'll need to enter it again to use {provider.name} features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteKey} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
