
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to listen for realtime updates to the api_keys table
 * @returns Object containing the listening status
 */
export function useRealtimeApiKeys() {
  const [isListening, setIsListening] = useState<boolean>(false);

  useEffect(() => {
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
          
          // Log the event for debugging
          console.log('API key change:', payload);
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

  return { isListening };
}
