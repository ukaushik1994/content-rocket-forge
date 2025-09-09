import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bug, RefreshCw, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { saveApiKey, getApiKey } from '@/services/apiKeyService';
import { syncApiKeysToProviders } from '@/services/aiService/providerSync';
import { toast } from 'sonner';

interface ApiKeyDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyDebugModal({ isOpen, onClose }: ApiKeyDebugModalProps) {
  const [testKey, setTestKey] = useState('');
  const [testProvider, setTestProvider] = useState('openai');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleTestSave = async () => {
    if (!testKey.trim()) {
      toast.error('Please enter a test API key');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🧪 Testing API key save process...');
      
      // Save the API key
      const success = await saveApiKey(testProvider as any, testKey);
      
      if (success) {
        toast.success('API key saved successfully!');
        await loadDebugInfo();
      } else {
        toast.error('Failed to save API key');
      }
    } catch (error: any) {
      console.error('Save test failed:', error);
      toast.error(`Save failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSync = async () => {
    setIsLoading(true);
    try {
      const success = await syncApiKeysToProviders();
      if (success) {
        toast.success('Sync completed successfully!');
        await loadDebugInfo();
      }
    } catch (error: any) {
      console.error('Sync test failed:', error);
      toast.error(`Sync failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDebugInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get API keys from different tables
      const [apiKeysResult, providersResult] = await Promise.all([
        supabase.from('api_keys').select('*').eq('user_id', user.id),
        supabase.from('ai_service_providers').select('*').eq('user_id', user.id)
      ]);

      // Test decrypt a key if one exists
      let decryptTest = null;
      if (apiKeysResult.data && apiKeysResult.data.length > 0) {
        try {
          const testService = apiKeysResult.data[0].service;
          const decrypted = await getApiKey(testService as any);
          decryptTest = {
            service: testService,
            hasDecrypted: !!decrypted,
            keyLength: decrypted?.length || 0
          };
        } catch (error: any) {
          decryptTest = { error: error.message };
        }
      }

      setDebugInfo({
        userId: user.id,
        apiKeys: apiKeysResult.data || [],
        providers: providersResult.data || [],
        decryptTest,
        errors: {
          apiKeys: apiKeysResult.error?.message,
          providers: providersResult.error?.message
        }
      });
    } catch (error: any) {
      console.error('Debug info failed:', error);
      setDebugInfo({ error: error.message });
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      loadDebugInfo();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            API Key Debug Console
          </DialogTitle>
          <DialogDescription>
            Debug API key storage and provider sync issues
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Test Save Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test API Key Save</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <select 
                  value={testProvider} 
                  onChange={(e) => setTestProvider(e.target.value)}
                  className="px-3 py-2 border rounded"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="gemini">Gemini</option>
                </select>
                <Input
                  value={testKey}
                  onChange={(e) => setTestKey(e.target.value)}
                  placeholder="Enter test API key (will be encrypted)"
                  className="flex-1"
                />
                <Button onClick={handleTestSave} disabled={isLoading} size="sm">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sync Test Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Provider Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={handleTestSync} disabled={isLoading} size="sm">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test Sync'}
                </Button>
                <Button onClick={loadDebugInfo} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Debug Info */}
          {debugInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Database State
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge variant="outline">User ID: {debugInfo.userId}</Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">API Keys Table ({debugInfo.apiKeys?.length || 0} entries)</h4>
                  {debugInfo.apiKeys?.length > 0 ? (
                    <div className="space-y-1 text-xs">
                      {debugInfo.apiKeys.map((key: any, i: number) => (
                        <div key={i} className="flex gap-2">
                          <Badge variant="secondary">{key.service}</Badge>
                          <span>Active: {key.is_active ? '✅' : '❌'}</span>
                          <span>Key Length: {key.encrypted_key?.length}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No API keys found</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">AI Service Providers Table ({debugInfo.providers?.length || 0} entries)</h4>
                  {debugInfo.providers?.length > 0 ? (
                    <div className="space-y-1 text-xs">
                      {debugInfo.providers.map((provider: any, i: number) => (
                        <div key={i} className="flex gap-2">
                          <Badge variant="secondary">{provider.provider}</Badge>
                          <span>Status: {provider.status}</span>
                          <span>Priority: {provider.priority}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No providers found</p>
                  )}
                </div>

                {debugInfo.decryptTest && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Decryption Test</h4>
                    <div className="text-xs">
                      {debugInfo.decryptTest.error ? (
                        <Badge variant="destructive">Error: {debugInfo.decryptTest.error}</Badge>
                      ) : (
                        <div className="flex gap-2">
                          <Badge variant="secondary">{debugInfo.decryptTest.service}</Badge>
                          <span>Decrypt: {debugInfo.decryptTest.hasDecrypted ? '✅' : '❌'}</span>
                          <span>Length: {debugInfo.decryptTest.keyLength}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(debugInfo.errors?.apiKeys || debugInfo.errors?.providers) && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-red-600">Errors</h4>
                    <div className="text-xs space-y-1">
                      {debugInfo.errors.apiKeys && <p>API Keys: {debugInfo.errors.apiKeys}</p>}
                      {debugInfo.errors.providers && <p>Providers: {debugInfo.errors.providers}</p>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}