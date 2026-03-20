import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProviderIcon } from './ProviderIcon';

const AI_PROVIDERS = [
  { id: 'openrouter', label: 'OpenRouter', badge: 'Recommended', badgeClass: 'bg-cyan-950/30 text-cyan-400 border-cyan-400/30' },
  { id: 'anthropic', label: 'Claude' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'gemini', label: 'Gemini', badge: 'High Performance', badgeClass: 'bg-emerald-950/30 text-emerald-400 border-emerald-400/30' },
  { id: 'mistral', label: 'Mistral' },
] as const;

type AiProviderId = typeof AI_PROVIDERS[number]['id'];

export function DefaultAiProviderSelector() {
  const [activeProvider, setActiveProvider] = useState<AiProviderId | null>(null);
  const [configuredProviders, setConfiguredProviders] = useState<Set<string>>(new Set());
  const [enableFallback, setEnableFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Parallel: get configured keys + active provider
      const [keysResult, providerResult] = await Promise.all([
        supabase
          .from('api_keys_metadata')
          .select('service')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .in('service', AI_PROVIDERS.map(p => p.id)),
        supabase
          .from('ai_service_providers')
          .select('provider, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .in('provider', AI_PROVIDERS.map(p => p.id))
          .limit(1)
      ]);

      const configured = new Set(keysResult.data?.map(k => k.service) || []);
      setConfiguredProviders(configured);

      const active = providerResult.data?.[0]?.provider as AiProviderId | undefined;
      setActiveProvider(active || null);

      setEnableFallback(getUserPreference('enableAiFallback') === true);
    } catch (err) {
      console.error('Failed to load AI provider state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderChange = async (providerId: string) => {
    const id = providerId as AiProviderId;
    if (!configuredProviders.has(id)) {
      toast.error(`Configure your ${AI_PROVIDERS.find(p => p.id === id)?.label} API key first`);
      return;
    }

    setIsSwitching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Deactivate all AI providers, then activate selected
      await supabase
        .from('ai_service_providers')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .in('provider', AI_PROVIDERS.map(p => p.id));

      await supabase
        .from('ai_service_providers')
        .upsert({
          user_id: user.id,
          provider: id,
          status: 'active',
          api_key: '',
          priority: 1,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,provider' });

      setActiveProvider(id);
      toast.success(`Switched to ${AI_PROVIDERS.find(p => p.id === id)?.label}`);
    } catch (err) {
      console.error('Failed to switch provider:', err);
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
      <Card className="border-border/20">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const hasAnyConfigured = configuredProviders.size > 0;

  return (
    <Card className="border-border/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Default AI Provider</CardTitle>
        <CardDescription>
          {hasAnyConfigured
            ? 'Select which AI provider to use across the application'
            : 'Configure at least one AI provider key below to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasAnyConfigured ? (
          <RadioGroup
            value={activeProvider || ''}
            onValueChange={handleProviderChange}
            className="flex flex-col sm:flex-row gap-4 flex-wrap"
            disabled={isSwitching}
          >
            {AI_PROVIDERS.map((provider) => {
              const isConfigured = configuredProviders.has(provider.id);
              const isActive = activeProvider === provider.id;

              return (
                <div key={provider.id} className={`flex items-center space-x-2 ${!isConfigured ? 'opacity-40' : ''}`}>
                  <RadioGroupItem value={provider.id} id={`ai-${provider.id}`} disabled={!isConfigured} />
                  <Label htmlFor={`ai-${provider.id}`} className="flex items-center gap-2 cursor-pointer">
                    <ProviderIcon provider={provider.id} />
                    <span>{provider.label}</span>
                    {'badge' in provider && provider.badge && (
                      <Badge variant="outline" className={`text-xs ${provider.badgeClass}`}>
                        {provider.badge}
                      </Badge>
                    )}
                    {isActive && isConfigured && (
                      <Badge variant="outline" className="text-xs bg-green-950/30 text-green-400 border-green-400/30">
                        <Check className="h-3 w-3 mr-1" /> Active
                      </Badge>
                    )}
                    {!isConfigured && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        No key
                      </Badge>
                    )}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-amber-400" />
            No AI providers configured yet. Add an API key in the AI Services section below.
          </div>
        )}

        {hasAnyConfigured && (
          <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-border/10">
            <Switch
              id="enable-fallback"
              checked={enableFallback}
              onCheckedChange={handleFallbackToggle}
            />
            <Label htmlFor="enable-fallback">
              <div>
                <span className="font-medium">Enable AI Provider Fallback</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Try alternative providers when your primary choice fails
                </p>
              </div>
            </Label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
