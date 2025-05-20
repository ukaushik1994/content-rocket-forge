
/**
 * Hook for working with API credentials
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getApiKey, saveApiKey, deleteApiKey } from '@/services/apiKeys/storage';
import { testApiKey } from '@/services/apiKeys/testing';
import { supabase } from '@/integrations/supabase/client';

interface UseApiCredentialsOptions {
  providerId: string;
  onSaveSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onTestSuccess?: () => void;
}

interface ApiCredentialState {
  apiKey: string;
  isLoading: boolean;
  isSaving: boolean;
  isTesting: boolean;
  isDeleting: boolean;
  isValid: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useApiCredentials({
  providerId,
  onSaveSuccess,
  onDeleteSuccess,
  onTestSuccess
}: UseApiCredentialsOptions) {
  const [state, setState] = useState<ApiCredentialState>({
    apiKey: '',
    isLoading: true,
    isSaving: false,
    isTesting: false,
    isDeleting: false,
    isValid: false,
    error: null,
    isAuthenticated: false
  });
  
  // Check authentication state
  useEffect(() => {
    const checkAuthState = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setState(prev => ({
        ...prev,
        isAuthenticated: !!user
      }));
    };
    
    checkAuthState();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState(prev => ({
          ...prev,
          isAuthenticated: !!session?.user
        }));
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const key = await getApiKey(providerId);
        setState(prev => ({
          ...prev,
          apiKey: key || '',
          isLoading: false,
          isValid: !!key
        }));
      } catch (error) {
        console.error(`Error fetching ${providerId} API key:`, error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load API key'
        }));
      }
    };
    
    fetchApiKey();
  }, [providerId, state.isAuthenticated]);
  
  const saveCredential = async (key: string) => {
    if (!key.trim()) {
      setState(prev => ({
        ...prev,
        error: 'API key is required'
      }));
      return false;
    }
    
    setState(prev => ({
      ...prev,
      isSaving: true,
      error: null
    }));
    
    try {
      const success = await saveApiKey(providerId, key);
      
      if (success) {
        setState(prev => ({
          ...prev,
          apiKey: key,
          isSaving: false,
          isValid: true
        }));
        
        toast.success(`API key saved successfully`);
        onSaveSuccess?.();
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: 'Failed to save API key'
        }));
        return false;
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error.message || 'Failed to save API key'
      }));
      return false;
    }
  };
  
  const testCredential = async (key: string = state.apiKey) => {
    if (!key.trim()) {
      setState(prev => ({
        ...prev,
        error: 'API key is required'
      }));
      return false;
    }
    
    setState(prev => ({
      ...prev,
      isTesting: true,
      error: null
    }));
    
    try {
      const isValid = await testApiKey(providerId, key);
      
      setState(prev => ({
        ...prev,
        isTesting: false,
        isValid
      }));
      
      if (isValid) {
        toast.success(`API key is valid`);
        onTestSuccess?.();
      } else {
        toast.error(`API key is invalid`);
        setState(prev => ({
          ...prev,
          error: 'Invalid API key'
        }));
      }
      
      return isValid;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isTesting: false,
        isValid: false,
        error: error.message || 'Failed to test API key'
      }));
      return false;
    }
  };
  
  const deleteCredential = async () => {
    setState(prev => ({
      ...prev,
      isDeleting: true,
      error: null
    }));
    
    try {
      const success = await deleteApiKey(providerId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          apiKey: '',
          isDeleting: false,
          isValid: false
        }));
        
        toast.success(`API key deleted successfully`);
        onDeleteSuccess?.();
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isDeleting: false,
          error: 'Failed to delete API key'
        }));
        return false;
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isDeleting: false,
        error: error.message || 'Failed to delete API key'
      }));
      return false;
    }
  };
  
  const setApiKey = (key: string) => {
    setState(prev => ({
      ...prev,
      apiKey: key,
      error: null
    }));
  };
  
  return {
    ...state,
    setApiKey,
    saveCredential,
    testCredential,
    deleteCredential
  };
}
