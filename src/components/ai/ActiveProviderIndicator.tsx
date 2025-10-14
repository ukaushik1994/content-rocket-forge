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

const PROVIDER_ICONS: Record<string, string> = {
  openrouter: "🔀",
  gemini: "✨",
  openai: "🤖",
  anthropic: "🧠",
  mistral: "🌪️",
  lmstudio: "🖥️"
};

export function ActiveProviderIndicator() {
  const [activeProvider, setActiveProvider] = useState<ActiveProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveProvider = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_service_providers')
        .select('provider, preferred_model')
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error fetching active provider:', error);
        setActiveProvider(null);
      } else {
        setActiveProvider(data);
      }
    } catch (error) {
      console.error('Error fetching active provider:', error);
      setActiveProvider(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveProvider();

    // Subscribe to real-time changes on ai_service_providers
    const channel = supabase
      .channel('active-provider-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_service_providers',
          filter: 'status=eq.active'
        },
        () => {
          fetchActiveProvider();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activeProvider) {
    return null;
  }

  const providerLabel = PROVIDER_LABELS[activeProvider.provider] || activeProvider.provider;
  const providerIcon = PROVIDER_ICONS[activeProvider.provider] || "🤖";

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
