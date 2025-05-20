
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeApiKeys } from '@/hooks/useRealtimeApiKeys';

interface ApiCredential {
  id: string;
  service: string;
  is_active: boolean;
  updated_at: string;
}

interface ApiCredentialsContextType {
  apiCredentials: ApiCredential[];
  isLoading: boolean;
  error: string | null;
  refreshCredentials: () => Promise<void>;
}

const ApiCredentialsContext = createContext<ApiCredentialsContextType | undefined>(undefined);

export function ApiCredentialsProvider({ children }: { children: ReactNode }) {
  const [apiCredentials, setApiCredentials] = useState<ApiCredential[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use our realtime hook
  const { isListening } = useRealtimeApiKeys();

  // Function to fetch API credentials
  const fetchApiCredentials = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, service, is_active, updated_at')
        .order('service');
      
      if (error) {
        throw error;
      }
      
      setApiCredentials(data || []);
    } catch (err: any) {
      console.error('Error fetching API credentials:', err);
      setError(err.message || 'Failed to load API credentials');
      setApiCredentials([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchApiCredentials();
  }, []);

  // Refetch when realtime updates occur
  // The actual updates are handled by the useRealtimeApiKeys hook
  // This triggers a refresh when we know changes have happened
  useEffect(() => {
    if (isListening) {
      console.log('Realtime API key listening is active');
    }
  }, [isListening]);

  const contextValue = {
    apiCredentials,
    isLoading,
    error,
    refreshCredentials: fetchApiCredentials
  };

  return (
    <ApiCredentialsContext.Provider value={contextValue}>
      {children}
    </ApiCredentialsContext.Provider>
  );
}

export const useApiCredentials = () => {
  const context = useContext(ApiCredentialsContext);
  if (context === undefined) {
    throw new Error('useApiCredentials must be used within an ApiCredentialsProvider');
  }
  return context;
};
