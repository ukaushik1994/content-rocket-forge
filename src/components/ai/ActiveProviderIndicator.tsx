import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setActiveProvider(null);
        setHasApiKey(false);
        setIsLoading(false);
        return;
      }

      // Fetch active provider
      const { data: providerData, error: providerError } = await supabase
        .from('ai_service_providers')
        .select('provider, preferred_model')
        .eq('status', 'active')
        .maybeSingle();

      if (providerError) {
        console.error('Error fetching active provider:', providerError);
        setActiveProvider(null);
        setHasApiKey(false);
        setIsLoading(false);
        return;
      }

      setActiveProvider(providerData);

      // If we have an active provider, check if API key exists
      if (providerData?.provider) {
        const { data: keyData, error: keyError } = await supabase
          .from('api_keys_metadata')
          .select('is_active')
          .eq('service', providerData.provider)
          .eq('is_active', true)
          .maybeSingle();

        if (keyError) {
          console.error('Error checking API key:', keyError);
          setHasApiKey(false);
        } else {
          setHasApiKey(!!keyData);
        }
      } else {
        setHasApiKey(false);
      }
    } catch (error) {
      console.error('Error fetching provider status:', error);
      setActiveProvider(null);
      setHasApiKey(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveProviderAndKey();

    // Subscribe to real-time changes on ai_service_providers
    const providerChannel = supabase
      .channel('active-provider-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_service_providers'
        },
        () => {
          fetchActiveProviderAndKey();
        }
      )
      .subscribe();

    // Subscribe to real-time changes on api_keys
    const keysChannel = supabase
      .channel('api-keys-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'api_keys'
        },
        () => {
          fetchActiveProviderAndKey();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(providerChannel);
      supabase.removeChannel(keysChannel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Only show if BOTH provider is active AND API key exists
  if (!activeProvider || !hasApiKey) {
    return null;
  }

  const providerLabel = PROVIDER_LABELS[activeProvider.provider] || activeProvider.provider;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary cursor-default">
            <span className="text-xs font-medium">{providerLabel}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            <strong>Active Model:</strong> {activeProvider.preferred_model}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
