import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { testAiApiKey } from '@/services/aiService/testing/keyTesting';
import { toast } from 'sonner';
import { AiProvider } from '@/services/aiService/types';
import { supabase } from '@/integrations/supabase/client';

export function TestAllProvidersButton() {
  const [isTesting, setIsTesting] = useState(false);

  const testAllProviders = async () => {
    setIsTesting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to test providers');
        return;
      }

      // Get all providers with API keys
      const { data: providers, error } = await supabase
        .from('ai_service_providers')
        .select('*')
        .eq('user_id', user.id)
        .not('api_key', 'is', null);

      if (error) {
        toast.error(`Failed to fetch providers: ${error.message}`);
        return;
      }

      if (!providers || providers.length === 0) {
        toast.info('No API keys configured to test');
        return;
      }

      const results: Array<{ provider: string; success: boolean; error?: string }> = [];

      // Test each provider
      for (const provider of providers) {
        console.log(`🧪 Testing ${provider.provider}...`);
        try {
          const success = await testAiApiKey(provider.provider as AiProvider, provider.api_key);
          results.push({ provider: provider.provider, success });
        } catch (error: any) {
          console.error(`❌ ${provider.provider} test failed:`, error);
          results.push({ 
            provider: provider.provider, 
            success: false, 
            error: error.message 
          });
        }
      }

      // Show summary
      const successful = results.filter(r => r.success).length;
      const total = results.length;
      
      if (successful === total) {
        toast.success(`✅ All ${total} providers tested successfully!`);
      } else {
        toast.warning(`⚠️ ${successful}/${total} providers working. Check individual results above.`);
      }

      console.log('🔍 Test Results Summary:', results);
      
    } catch (error: any) {
      console.error('💥 Test all providers error:', error);
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Button 
      onClick={testAllProviders} 
      disabled={isTesting}
      variant="outline"
      className="w-full"
    >
      {isTesting ? 'Testing All Providers...' : 'Test All AI Providers'}
    </Button>
  );
}