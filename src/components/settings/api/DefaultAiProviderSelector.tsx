import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProviderIcon } from './ProviderIcon';

const AI_PROVIDERS = [
  { id: 'openrouter', label: 'OpenRouter' },
  { id: 'anthropic', label: 'Claude' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'mistral', label: 'Mistral' },
] as const;

type AiProviderId = typeof AI_PROVIDERS[number]['id'];

export function DefaultAiProviderSelector() {
  const [activeProvider, setActiveProvider] = useState<AiProviderId | null>(null);
  const [configuredProviders, setConfiguredProviders] = useState<Set<string>>(new Set());
  const [enableFallback, setEnableFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => { loadState(); }, []);

  const loadState = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [keysResult, providerResult] = await Promise.all([
        supabase.from('api_keys_metadata').select('service').eq('user_id', user.id).eq('is_active', true).in('service', AI_PROVIDERS.map(p => p.id)),
        supabase.from('ai_service_providers').select('provider, status').eq('user_id', user.id).eq('status', 'active').in('provider', AI_PROVIDERS.map(p => p.id)).limit(1)
      ]);
      setConfiguredProviders(new Set(keysResult.data?.map(k => k.service) || []));
      setActiveProvider((providerResult.data?.[0]?.provider as AiProviderId) || null);
      setEnableFallback(getUserPreference('enableAiFallback') === true);
    } catch (err) {
      console.error('Failed to load AI provider state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderChange = async (id: AiProviderId) => {
    if (!configuredProviders.has(id)) {
      toast.error(`Configure your ${AI_PROVIDERS.find(p => p.id === id)?.label} API key first`);
      return;
    }
    if (activeProvider === id) return;
    setIsSwitching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('ai_service_providers').update({ status: 'inactive', updated_at: new Date().toISOString() }).eq('user_id', user.id).in('provider', AI_PROVIDERS.map(p => p.id));
      await supabase.from('ai_service_providers').upsert({ user_id: user.id, provider: id, status: 'active', api_key: '', priority: 1, updated_at: new Date().toISOString() }, { onConflict: 'user_id,provider' });
      setActiveProvider(id);
      document.dispatchEvent(new Event('provider-changed'));
      toast.success(`Switched to ${AI_PROVIDERS.find(p => p.id === id)?.label}`);
    } catch {
      toast.error('Failed to switch provider');
    } finally {
      setIsSwitching(false);
    }
  };

  const handleFallbackToggle = async (checked: boolean) => {
    setEnableFallback(checked);
    await saveUserPreference('enableAiFallback', checked);
    toast.success(`AI fallback ${checked ? 'enabled' : 'disabled'}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasAny = configuredProviders.size > 0;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-foreground">AI Provider</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {hasAny ? 'Select your default provider' : 'Add an API key below to get started'}
        </p>
      </div>

      {hasAny ? (
        <div className="flex flex-wrap gap-2">
          {AI_PROVIDERS.map((provider) => {
            const configured = configuredProviders.has(provider.id);
            const active = activeProvider === provider.id;

            return (
              <button
                key={provider.id}
                onClick={() => handleProviderChange(provider.id)}
                disabled={isSwitching || !configured}
                className={`
                  group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm
                  transition-all duration-200 outline-none
                  ${active
                    ? 'bg-white/[0.08] border border-emerald-500/40 text-foreground shadow-[0_0_12px_-4px_rgba(16,185,129,0.3)]'
                    : configured
                      ? 'bg-white/[0.04] border border-white/[0.08] text-foreground/80 hover:bg-white/[0.07] hover:border-white/[0.15]'
                      : 'bg-white/[0.02] border border-white/[0.05] text-muted-foreground/50 cursor-not-allowed'
                  }
                `}
              >
                <ProviderIcon provider={provider.id} />
                <span className="font-medium">{provider.label}</span>
                {active && (
                  <Check className="h-3 w-3 text-emerald-400 ml-0.5" />
                )}
                {!configured && (
                  <span className="text-[10px] text-muted-foreground/40 ml-0.5">no key</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400/70" />
          <span>No providers configured</span>
        </div>
      )}

      {hasAny && (
        <div className="flex items-center gap-2.5 pt-1">
          <Switch
            id="enable-fallback"
            checked={enableFallback}
            onCheckedChange={handleFallbackToggle}
            className="scale-[0.85]"
          />
          <Label htmlFor="enable-fallback" className="text-xs text-muted-foreground cursor-pointer">
            Auto-fallback to other providers
          </Label>
        </div>
      )}
    </div>
  );
}
