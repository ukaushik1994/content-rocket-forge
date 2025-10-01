import { useState, useCallback, useRef } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
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
      console.log('🚀 Starting streaming request...');

      // Get Supabase project URL
      const streamUrl = 'https://iqiundzzcepmuykcnfbc.supabase.co/functions/v1/ai-streaming';

      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          messages,
          context,
          userId,
          features: ['visual_data', 'solution_intelligence', 'context_awareness'],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Streaming request failed');
      }

      // Check if we have a readable stream
      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      console.log('📡 Starting to read stream...');

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('✅ Stream completed');
          break;
        }

        // Decode the chunk
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
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

                // Call the token callback
                onToken(parsed.content, fullContent);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, data);
            }
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
