import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, TestTube, Bug, ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ApiProvider } from './types';
import { getApiKey, saveApiKey, testApiKey, deleteApiKey } from '@/services/apiKeyService';
import { toast } from 'sonner';

interface SlideoutConfigPanelProps {
  provider: ApiProvider | null;
  isOpen: boolean;
  onClose: () => void;
  onSetDefault?: (providerId: string) => void;
  defaultAiProvider?: string;
}

export const SlideoutConfigPanel: React.FC<SlideoutConfigPanelProps> = ({
  provider,
  isOpen,
  onClose,
  onSetDefault,
  defaultAiProvider
}) => {
  const [activeTab, setActiveTab] = useState('config');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // API operations are imported directly

  useEffect(() => {
    if (provider && isOpen) {
      loadProviderData();
    }
  }, [provider, isOpen]);

  const loadProviderData = async () => {
    if (!provider) return;
    
    setIsLoading(true);
    try {
      const existingKey = await getApiKey(provider.serviceKey as any);
      if (existingKey) {
        setApiKey(existingKey);
        setIsEnabled(true);
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!provider || !apiKey.trim()) return;

    setIsLoading(true);
    try {
      await saveApiKey(provider.serviceKey as any, apiKey.trim());
      setIsEnabled(true);
      toast.success(`${provider.name} API key saved successfully`);
      
      // Auto-test after saving
      handleTest();
    } catch (error) {
      toast.error('Failed to save API key');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!provider || !apiKey.trim()) return;

    setIsTesting(true);
    setTestResult(null);
    setDebugInfo(null);
    
    try {
      const result = await testApiKey(provider.serviceKey as any, apiKey.trim());
      setTestResult({ success: true, message: 'Connection successful!' });
      setDebugInfo(result);
      toast.success(`${provider.name} connection test passed`);
    } catch (error: any) {
      const message = error.message || 'Connection failed';
      setTestResult({ success: false, message });
      setDebugInfo(error);
      toast.error(`${provider.name} connection test failed`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!provider) return;

    setIsLoading(true);
    try {
      await deleteApiKey(provider.serviceKey as any);
      setApiKey('');
      setIsEnabled(false);
      setTestResult(null);
      setDebugInfo(null);
      toast.success(`${provider.name} API key deleted`);
    } catch (error) {
      toast.error('Failed to delete API key');
      console.error('Delete error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = () => {
    if (provider && onSetDefault) {
      onSetDefault(provider.id);
      toast.success(`${provider.name} set as default AI provider`);
    }
  };

  if (!provider) return null;

  const isDefault = defaultAiProvider === provider.id;
  const canSetDefault = provider.category === 'AI' && isEnabled;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-background border-l border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <provider.icon className="h-6 w-6" />
                <div>
                  <h2 className="text-lg font-semibold">{provider.name}</h2>
                  <p className="text-sm text-muted-foreground">{provider.category}</p>
                </div>
                {isDefault && (
                  <Star className="h-4 w-4 text-neon-purple fill-current" />
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="config" className="flex items-center space-x-1">
                    <Key className="h-3 w-3" />
                    <span>Config</span>
                  </TabsTrigger>
                  <TabsTrigger value="test" className="flex items-center space-x-1">
                    <TestTube className="h-3 w-3" />
                    <span>Test</span>
                  </TabsTrigger>
                  <TabsTrigger value="debug" className="flex items-center space-x-1">
                    <Bug className="h-3 w-3" />
                    <span>Debug</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="config" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="api-key">API Key</Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        id="api-key"
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API key..."
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? 'Hide' : 'Show'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="enabled">Enable Provider</Label>
                    <Switch
                      id="enabled"
                      checked={isEnabled}
                      onCheckedChange={setIsEnabled}
                    />
                  </div>

                  {canSetDefault && (
                    <div className="flex items-center justify-between">
                      <Label>Set as Default AI Provider</Label>
                      <Button
                        variant={isDefault ? "default" : "outline"}
                        size="sm"
                        onClick={handleSetDefault}
                        disabled={isDefault}
                      >
                        {isDefault ? 'Default' : 'Set Default'}
                      </Button>
                    </div>
                  )}

                  <div className="pt-4 space-y-2">
                    <Button onClick={handleSave} disabled={isLoading || !apiKey.trim()} className="w-full">
                      {isLoading ? 'Saving...' : 'Save API Key'}
                    </Button>
                    
                    {apiKey && (
                      <Button variant="outline" onClick={handleDelete} disabled={isLoading} className="w-full">
                        Delete API Key
                      </Button>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-muted-foreground mb-2">{provider.description}</p>
                    <Button variant="link" size="sm" asChild className="p-0 h-auto">
                      <a href={provider.link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1">
                        <span>Get API Key</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="test" className="space-y-4 mt-4">
                  <Button onClick={handleTest} disabled={isTesting || !apiKey.trim()} className="w-full">
                    {isTesting ? 'Testing...' : 'Test Connection'}
                  </Button>

                  {testResult && (
                    <div className={`p-3 rounded-md ${testResult.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {testResult.message}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="debug" className="space-y-4 mt-4">
                  {debugInfo ? (
                    <pre className="text-xs bg-black/20 p-3 rounded-md overflow-auto max-h-64">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Run a connection test to see debug information.
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};