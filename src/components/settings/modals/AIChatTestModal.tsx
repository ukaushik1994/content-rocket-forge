import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIChatTestModalProps {
  provider: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTestComplete?: (provider: string, success: boolean) => void;
}

export function AIChatTestModal({ provider, isOpen, onClose, onTestComplete }: AIChatTestModalProps) {
  const [testMessage, setTestMessage] = useState('Hello! Can you help me with SEO content creation?');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  if (!provider) return null;

  const handleTestChat = async () => {
    if (!testMessage.trim()) {
      toast.error('Please enter a test message');
      return;
    }

    setIsLoading(true);
    setTestComplete(false);
    setResponse('');

    try {
      const startTime = Date.now();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get decrypted API keys from frontend
      const { getApiKey } = await import('@/services/apiKeys/crud');
      const apiKeys: Record<string, string> = {};
      
      // Try to get keys for all providers
      const providers: ('openrouter' | 'anthropic' | 'openai')[] = ['openrouter', 'anthropic', 'openai'];
      for (const providerName of providers) {
        try {
          const key = await getApiKey(providerName);
          if (key) {
            apiKeys[providerName] = key;
          }
        } catch (error) {
          console.log(`No ${providerName} key available:`, error);
        }
      }
      
      console.log('🔑 Available decrypted keys for test:', Object.keys(apiKeys));
      
      if (Object.keys(apiKeys).length === 0) {
        throw new Error('No API keys configured. Please add at least one API key in Settings.');
      }

      // Call enhanced-ai-chat edge function with decrypted keys
      console.log('🧪 Testing AI with message:', testMessage);
      const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: {
          messages: [
            {
              role: 'user',
              content: testMessage
            }
          ],
          userId: user.id,
          apiKeys
        }
      });

      console.log('🔍 Edge function response:', { data, error });

      if (error) {
        throw new Error(error.message || 'Failed to call AI service');
      }

      const responseTime = Date.now() - startTime;

      // Parse the enhanced chat response format
      if (data?.message) {
        setResponse(data.message);
        setTestSuccess(true);
        setTestComplete(true);
        toast.success(`✅ AI service test successful! (${responseTime}ms) Provider: ${data.provider || 'Unknown'}`);
        
        if (onTestComplete && provider) {
          onTestComplete(provider, true);
        }
      } else {
        throw new Error('No message received from AI service');
      }
    } catch (error: any) {
      console.error('AI test failed:', error);
      setResponse(`Error: ${error.message || 'Failed to connect to AI provider'}`);
      setTestSuccess(false);
      setTestComplete(true);
      toast.error(`❌ AI Chat test failed`);
      
      if (onTestComplete && provider) {
        onTestComplete(provider, false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTestMessage('Hello! Can you help me with SEO content creation?');
    setResponse('');
    setTestComplete(false);
    setTestSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Test {provider?.charAt(0).toUpperCase() + provider?.slice(1)} Chat
          </DialogTitle>
          <DialogDescription>
            Send a test message to verify your AI provider is working correctly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Test Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Message</label>
            <div className="flex gap-2">
              <Input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter your test message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleTestChat} 
                disabled={isLoading || !testMessage.trim()}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Response Display */}
          {(response || isLoading) && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  ) : testSuccess ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {isLoading ? 'Getting response...' : testSuccess ? 'Test Successful' : 'Test Failed'}
                  </span>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm">Waiting for {provider} response...</span>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <div className={`text-sm whitespace-pre-wrap ${testSuccess ? 'text-foreground' : 'text-red-600'}`}>
                      {response}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Connection Status */}
          {testComplete && (
            <div className={`p-3 rounded-lg text-sm ${
              testSuccess 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {testSuccess ? (
                <>
                  <strong>✅ Connection Verified</strong>
                  <br />
                  Your {provider} API key is working correctly and the service is responding as expected.
                </>
              ) : (
                <>
                  <strong>❌ Connection Failed</strong>
                  <br />
                  Please check your API key configuration and try again. Make sure your API key has the necessary permissions.
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}