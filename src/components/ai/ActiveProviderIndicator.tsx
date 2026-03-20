import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ProviderLogo } from "@/components/ui/provider-logo";
import { Loader2 } from "lucide-react";

interface ActiveProvider {
  provider: string;
  preferred_model: string;
}

const PROVIDER_LABELS: Record<string, string> = {
  openrouter: "OpenRouter",
  gemini: "Gemini",
  openai: "OpenAI",
  anthropic: "Anthropic",
  mistral: "Mistral",
  lmstudio: "LM Studio"
};

export function ActiveProviderIndicator() {
  const [activeProvider, setActiveProvider] = useState<ActiveProvider | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveProviderAndKey = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setActiveProvider(null);
        setHasApiKey(false);
        setIsLoading(false);
        return;
      }

      const { data: providerData, error: providerError } = await supabase
        .from('ai_service_providers')
        .select('provider, preferred_model')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (providerError) {
        console.log('[ActiveProvider] Query error:', providerError.message);
        setActiveProvider(null);
        setHasApiKey(false);
        setIsLoading(false);
        return;
      }

      setActiveProvider(providerData);

      if (providerData?.provider) {
        const { data: keyData, error: keyError } = await supabase
          .from('api_keys_metadata')
          .select('is_active')
          .eq('user_id', user.id)
          .eq('service', providerData.provider)
          .eq('is_active', true)
          .maybeSingle();

        setHasApiKey(keyError ? false : !!keyData);
      } else {
        setHasApiKey(false);
      }
    } catch (error) {
      setActiveProvider(null);
      setHasApiKey(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveProviderAndKey();

    const handleProviderChanged = () => fetchActiveProviderAndKey();
    document.addEventListener('provider-changed', handleProviderChanged);

    const providerChannel = supabase
      .channel('active-provider-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_service_providers' }, () => fetchActiveProviderAndKey())
      .subscribe();

    const keysChannel = supabase
      .channel('api-keys-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'api_keys' }, () => fetchActiveProviderAndKey())
      .subscribe();

    return () => {
      document.removeEventListener('provider-changed', handleProviderChanged);
      supabase.removeChannel(providerChannel);
      supabase.removeChannel(keysChannel);
    };
  }, []);

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full border border-border/10" disabled>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </Button>
    );
  }

  if (!activeProvider || !hasApiKey) {
    return null;
  }

  const providerLabel = PROVIDER_LABELS[activeProvider.provider] || activeProvider.provider;
  const normalizedProvider = activeProvider.provider.toLowerCase() as 'openai' | 'anthropic' | 'gemini' | 'lmstudio' | 'mistral' | 'openrouter';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-border/10 hover:border-border/30 text-muted-foreground hover:text-foreground"
          >
            <ProviderLogo provider={normalizedProvider} size="sm" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            <strong>{providerLabel}</strong> — {activeProvider.preferred_model}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
