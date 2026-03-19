import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Key, ExternalLink, CheckCircle, Loader2, Sparkles, Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface APIKeyOnboardingProps {
  open: boolean;
  onComplete: () => void;
}

const PROVIDERS = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access 100+ models (GPT-4, Claude, Gemini) with one key',
    badge: 'Recommended',
    icon: Sparkles,
    getKeyUrl: 'https://openrouter.ai/keys',
    placeholder: 'sk-or-v1-...',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4 Turbo, DALL·E 3',
    badge: null,
    icon: Brain,
    getKeyUrl: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-...',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet, Claude 3 Opus',
    badge: null,
    icon: Zap,
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-...',
  },
] as const;

export const APIKeyOnboarding: React.FC<APIKeyOnboardingProps> = ({ open, onComplete }) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleTestAndSave = async () => {
    if (!apiKey.trim() || !selectedProvider) return;

    setIsTesting(true);
    try {
      // Test the key
      const { data: testData, error: testError } = await supabase.functions.invoke('ai-proxy', {
        body: {
          service: selectedProvider,
          endpoint: 'test',
          apiKey: apiKey.trim(),
        },
      });

      if (testError || !testData?.success) {
        toast.error('API key test failed', {
          description: testData?.error || testError?.message || 'Key could not be verified',
        });
        setIsTesting(false);
        return;
      }

      // Test passed — save it
      setIsTesting(false);
      setIsSaving(true);

      // Encrypt server-side
      const { data: encryptData, error: encryptError } = await supabase.functions.invoke('secure-api-key', {
        body: { action: 'encrypt', apiKey: apiKey.trim(), service: selectedProvider },
      });

      if (encryptError || !encryptData?.success) {
        throw new Error(encryptError?.message || 'Encryption failed');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upsert to api_keys table
      const { error: upsertError } = await supabase.from('api_keys').upsert(
        {
          user_id: user.id,
          service: selectedProvider,
          encrypted_key: encryptData.encryptedKey,
          is_active: true,
        },
        { onConflict: 'user_id,service' }
      );

      if (upsertError) throw upsertError;

      toast.success('API key saved!', { description: `${PROVIDERS.find(p => p.id === selectedProvider)?.name} is ready to use.` });
      onComplete();
    } catch (err: any) {
      toast.error('Failed to save API key', { description: err.message });
    } finally {
      setIsTesting(false);
      setIsSaving(false);
    }
  };

  const selectedProviderData = PROVIDERS.find(p => p.id === selectedProvider);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Key className="h-5 w-5 text-primary" />
            Connect an AI Provider
          </DialogTitle>
          <DialogDescription>
            Creaiter needs an AI provider key to power content generation, analysis, and chat. Choose one to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Provider Cards */}
          <div className="grid gap-3">
            {PROVIDERS.map((provider) => {
              const Icon = provider.icon;
              const isSelected = selectedProvider === provider.id;
              return (
                <Card
                  key={provider.id}
                  className={cn(
                    'p-4 cursor-pointer transition-all duration-200 border-2',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-transparent hover:border-border hover:bg-muted/30'
                  )}
                  onClick={() => {
                    setSelectedProvider(provider.id);
                    setApiKey('');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isSelected ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{provider.name}</span>
                        {provider.badge && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {provider.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{provider.description}</p>
                    </div>
                    {isSelected && <CheckCircle className="h-5 w-5 text-primary shrink-0" />}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Key Input */}
          <AnimatePresence>
            {selectedProviderData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="api-key" className="text-sm">API Key</Label>
                  <a
                    href={selectedProviderData.getKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Get a key <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <Input
                  id="api-key"
                  type="password"
                  placeholder={selectedProviderData.placeholder}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  autoFocus
                />
                <Button
                  onClick={handleTestAndSave}
                  disabled={!apiKey.trim() || isTesting || isSaving}
                  className="w-full"
                >
                  {isTesting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Testing connection...</>
                  ) : isSaving ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    'Test & Save'
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
