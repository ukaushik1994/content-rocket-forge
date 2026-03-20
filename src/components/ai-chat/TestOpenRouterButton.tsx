import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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

      // C2: Use raw fetch matching the sendMessage pattern
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || SUPABASE_KEY;

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/enhanced-ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': SUPABASE_KEY,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
          context: {}
        })
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error('❌ OpenRouter test failed:', errText);
        toast({
          title: "OpenRouter Test Failed",
          description: `HTTP ${resp.status}: ${errText.slice(0, 100)}`,
          variant: "destructive"
        });
      } else {
        const data = await resp.json();
        console.log('✅ OpenRouter test successful:', data);
        toast({
          title: "OpenRouter Test Successful",
          description: `Response received — connection working`,
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
      {isTesting ? "Testing..." : "Test OpenRouter"}
    </Button>
  );
};
