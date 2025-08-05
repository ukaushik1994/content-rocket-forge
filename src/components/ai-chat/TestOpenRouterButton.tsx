import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const TestOpenRouterButton = () => {
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const testOpenRouterConnection = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to test OpenRouter connection",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    try {
      console.log('🧪 Testing OpenRouter connection...');
      
      // Test the enhanced-ai-chat function directly
      const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: {
          messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
          userId: user.id
        }
      });

      if (error) {
        console.error('❌ OpenRouter test failed:', error);
        toast({
          title: "OpenRouter Test Failed",
          description: error.message || "Connection test failed",
          variant: "destructive"
        });
      } else {
        console.log('✅ OpenRouter test successful:', data);
        toast({
          title: "OpenRouter Test Successful",
          description: `Response received using ${data.provider} with model ${data.model}`,
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('❌ Test error:', error);
      toast({
        title: "Test Error",
        description: error.message || "An error occurred during testing",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Button 
      onClick={testOpenRouterConnection}
      disabled={isTesting}
      variant="outline"
      size="sm"
    >
      {isTesting ? 'Testing...' : 'Test OpenRouter Connection'}
    </Button>
  );
};