
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ApiKeyType } from '@/services/apiKeys/types';

/**
 * Hook to listen for realtime updates to the api_keys table
 * and provide current API keys for the authenticated user
 */
export function useRealtimeApiKeys() {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [apiKeys, setApiKeys] = useState<ApiKeyType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all API keys for the current user
  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setApiKeys([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
        
      if (error) {
        console.error('Error fetching API keys:', error);
        setError('Failed to fetch API keys');
        return;
      }
      
      setApiKeys(data || []);
    } catch (err: any) {
      console.error('Error in fetchApiKeys:', err);
      setError(err.message || 'An error occurred while fetching API keys');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
    
    // Set up the realtime subscription for api_keys
    const channel = supabase
      .channel('api-keys-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'api_keys'
        },
        (payload) => {
          // Refetch all keys to ensure we have the latest data
          fetchApiKeys();
          
          const eventType = payload.eventType;
          
          // Handle different event types
          switch (eventType) {
            case 'INSERT':
              toast.success('New API key added');
              break;
            case 'UPDATE':
              toast.info('API key updated');
              break;
            case 'DELETE':
              toast.info('API key removed');
              break;
            default:
              console.log('Unknown event type:', eventType);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsListening(true);
          console.log('Listening for API key changes');
        }
      });

    // Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
      setIsListening(false);
    };
  }, []);

  // Function to manually refresh the API keys
  const refreshApiKeys = () => {
    fetchApiKeys();
  };

  return { 
    apiKeys, 
    isLoading, 
    error, 
    isListening,
    refreshApiKeys
  };
}
