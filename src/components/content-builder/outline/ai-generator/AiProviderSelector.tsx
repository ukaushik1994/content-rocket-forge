
import React, { useState, useEffect } from 'react';
import { AiServiceStatusIndicator } from '@/components/ai/AiServiceStatusIndicator';
import { AiProvider } from '@/services/aiService/types';
import { hasApiKey } from '@/services/apiKeys/crud';
import { CheckCircle, XCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface AiProviderSelectorProps {
  aiProvider: AiProvider;
  setAiProvider: (provider: AiProvider) => void;
  availableProviders?: AiProvider[];
}

interface ProviderStatus {
  [key: string]: boolean;
}

export function AiProviderSelector({ 
  aiProvider, 
  setAiProvider,
  availableProviders = ['openai', 'anthropic', 'gemini', 'mistral', 'lmstudio', 'openrouter']
}: AiProviderSelectorProps) {
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({});
  const [isLoading, setIsLoading] = useState(true);
  const [configuredProviders, setConfiguredProviders] = useState<AiProvider[]>([]);

  // Get display names for providers
  const getProviderDisplayName = (provider: string): string => {
    switch(provider) {
      case 'openai': return 'OpenAI';
      case 'anthropic': return 'Claude';
      case 'gemini': return 'Gemini';
      case 'mistral': return 'Mistral';
      case 'lmstudio': return 'LM Studio';
      case 'openrouter': return 'OpenRouter';
      default: return provider;
    }
  };

  // Check API key status for all providers
  const checkProviderStatus = async () => {
    setIsLoading(true);
    const status: ProviderStatus = {};
    const configured: AiProvider[] = [];

    for (const provider of availableProviders) {
      try {
        const hasKey = await hasApiKey(provider as any);
        status[provider] = hasKey;
        if (hasKey) {
          configured.push(provider);
        }
      } catch (error) {
        console.error(`Error checking ${provider} API key:`, error);
        status[provider] = false;
      }
    }

    setProviderStatus(status);
    setConfiguredProviders(configured);
    setIsLoading(false);

    // Auto-select first configured provider if current selection isn't configured
    if (!status[aiProvider] && configured.length > 0) {
      setAiProvider(configured[0]);
      toast.success(`Switched to ${getProviderDisplayName(configured[0])} (configured)`);
    }
  };

  useEffect(() => {
    checkProviderStatus();
  }, []);

  const handleProviderSelect = (provider: AiProvider) => {
    if (!providerStatus[provider]) {
      toast.error(`${getProviderDisplayName(provider)} API key is not configured. Please set it up in Settings.`);
      return;
    }
    setAiProvider(provider);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">AI Service:</span>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <div className="px-3 py-1 text-xs bg-white/5 rounded-full animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/70">AI Service:</span>
        <AiServiceStatusIndicator size="sm" />
        <span className="text-xs text-white/60">
          {configuredProviders.length > 0 
            ? `${configuredProviders.length} provider${configuredProviders.length > 1 ? 's' : ''} ready`
            : 'No providers configured'
          }
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        {availableProviders.map((provider) => {
          const isConfigured = providerStatus[provider];
          const isSelected = aiProvider === provider;
          
          return (
            <button
              key={provider}
              className={`relative flex items-center gap-1 px-3 py-1 text-xs rounded-full transition-colors ${
                isSelected 
                  ? 'bg-neon-purple text-white' 
                  : isConfigured
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-white/5 text-white/40 cursor-not-allowed'
              }`}
              onClick={() => handleProviderSelect(provider as AiProvider)}
              disabled={!isConfigured}
            >
              {isConfigured ? (
                <CheckCircle className="w-3 h-3 text-green-400" />
              ) : (
                <XCircle className="w-3 h-3 text-red-400" />
              )}
              {getProviderDisplayName(provider)}
            </button>
          );
        })}
        
        {configuredProviders.length === 0 && (
          <button
            className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 transition-colors"
            onClick={() => window.location.href = '/settings?tab=api'}
          >
            <Settings className="w-3 h-3" />
            Setup API Keys
          </button>
        )}
      </div>
    </div>
  );
}
