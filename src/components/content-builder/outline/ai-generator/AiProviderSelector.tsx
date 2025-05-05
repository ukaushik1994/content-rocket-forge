
import React, { useEffect, useState } from 'react';
import { getApiKey } from '@/services/apiKeyService';
import { getUserPreference } from '@/services/userPreferencesService';

type AiProvider = 'openai' | 'anthropic' | 'gemini';

interface AiProviderSelectorProps {
  aiProvider: AiProvider;
  setAiProvider: (provider: AiProvider) => void;
  availableProviders?: AiProvider[];
}

export function AiProviderSelector({ 
  aiProvider, 
  setAiProvider
}: AiProviderSelectorProps) {
  const [configuredProviders, setConfiguredProviders] = useState<AiProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get display names for providers
  const getProviderDisplayName = (provider: string): string => {
    switch(provider) {
      case 'openai': return 'OpenAI';
      case 'anthropic': return 'Claude';
      case 'gemini': return 'Gemini';
      default: return provider;
    }
  };

  // Load available providers
  useEffect(() => {
    const checkConfiguredProviders = async () => {
      setIsLoading(true);
      const available: AiProvider[] = [];
      
      // Check each provider
      for (const provider of ['openai', 'anthropic', 'gemini'] as AiProvider[]) {
        try {
          const key = await getApiKey(provider);
          if (key) {
            available.push(provider);
          }
        } catch (error) {
          console.error(`Error checking API key for ${provider}:`, error);
        }
      }
      
      setConfiguredProviders(available);
      
      // If current provider is not available but we have others, select the first available
      if (available.length > 0 && !available.includes(aiProvider)) {
        // Get default provider from user preferences
        const defaultProvider = getUserPreference('defaultAiProvider') as AiProvider;
        if (defaultProvider && available.includes(defaultProvider)) {
          setAiProvider(defaultProvider);
        } else {
          setAiProvider(available[0]);
        }
      }
      
      setIsLoading(false);
    };
    
    checkConfiguredProviders();
  }, [aiProvider, setAiProvider]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-white/70">AI Provider:</span>
      <div className="flex items-center gap-1">
        {isLoading ? (
          <div className="bg-white/10 rounded-full px-3 py-1 text-xs animate-pulse w-24 h-6"></div>
        ) : configuredProviders.length > 0 ? (
          configuredProviders.map((provider) => (
            <button
              key={provider}
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                aiProvider === provider 
                  ? 'bg-neon-purple text-white' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              onClick={() => setAiProvider(provider)}
            >
              {getProviderDisplayName(provider)}
            </button>
          ))
        ) : (
          <div className="bg-red-900/20 border border-red-500/30 rounded-full px-3 py-1 text-xs text-red-300">
            No API keys configured
          </div>
        )}
      </div>
    </div>
  );
}
