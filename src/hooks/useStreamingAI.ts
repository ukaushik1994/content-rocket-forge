import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StreamingState {
  isStreaming: boolean;
  currentMessage: string;
  error: string | null;
}

export const useStreamingAI = () => {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    currentMessage: '',
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const streamMessage = useCallback(async (
    messages: Array<{ role: string; content: string }>,
    context: any,
    userId: string,
    onToken: (token: string, fullContent: string) => void,
    onComplete: (fullContent: string) => void,
    onError: (error: string) => void
  ) => {
    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setState({
      isStreaming: true,
      currentMessage: '',
      error: null,
    });

    try {
      console.log('🚀 Starting TRUE streaming request...');

      // Get auth token
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Use the streaming endpoint
      const streamUrl = `${import.meta.env.VITE_SUPABASE_URL || 'https://iqiundzzcepmuykcnfbc.supabase.co'}/functions/v1/ai-streaming`;

      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages,
          context,
          userId,
          features: ['streaming'],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      // Check if we have a readable stream (SSE)
      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      console.log('📡 Starting to read SSE stream...');

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('✅ Stream completed');
          break;
        }

        // Decode the chunk
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          // Handle CRLF
          if (line.endsWith('\r')) {
            line = line.slice(0, -1);
          }

          // Skip empty lines and comments
          if (line.trim() === '' || line.startsWith(':')) continue;

          // Parse SSE data
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              console.log('🎉 Stream marked as done');
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'token' && parsed.content) {
                fullContent += parsed.content;
                
                setState(prev => ({
                  ...prev,
                  currentMessage: fullContent,
                }));

                // Call the token callback immediately for real-time rendering
                onToken(parsed.content, fullContent);
              } else if (parsed.type === 'complete') {
                // Use the complete content from server if available
                if (parsed.content) {
                  fullContent = parsed.content;
                }
                console.log('✅ Received completion event');
              } else if (parsed.type === 'error') {
                throw new Error(parsed.error || 'Stream error');
              }
            } catch (e) {
              // If JSON parse fails, it might be a partial line - put it back
              if (e instanceof SyntaxError) {
                buffer = line + '\n' + buffer;
                break;
              }
              console.error('Error parsing SSE data:', e, data);
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]' || data === '') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'token' && parsed.content) {
              fullContent += parsed.content;
              onToken(parsed.content, fullContent);
            }
          } catch (e) {
            // Ignore parse errors for leftover data
          }
        }
      }

      setState({
        isStreaming: false,
        currentMessage: fullContent,
        error: null,
      });

      onComplete(fullContent);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted by user');
        return;
      }

      console.error('Streaming error:', error);
      const errorMessage = error.message || 'Failed to stream response';
      
      setState({
        isStreaming: false,
        currentMessage: '',
        error: errorMessage,
      });

      onError(errorMessage);

      toast({
        title: "Streaming Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState({
      isStreaming: false,
      currentMessage: '',
      error: null,
    });
  }, []);

  return {
    ...state,
    streamMessage,
    cancelStream,
  };
};
