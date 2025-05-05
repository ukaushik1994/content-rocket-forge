
import React from 'react';
import { ProviderStatusIndicator } from './ProviderStatusIndicator';

type AiProvider = 'openai' | 'anthropic' | 'gemini' | 'mistral';

interface AiProviderSelectorProps {
  aiProvider: AiProvider;
  setAiProvider: (provider: AiProvider) => void;
  availableProviders?: AiProvider[];
}

export function AiProviderSelector({ 
  aiProvider, 
  setAiProvider,
  availableProviders = ['openai', 'anthropic', 'gemini', 'mistral']
}: AiProviderSelectorProps) {
  // Get display names for providers
  const getProviderDisplayName = (provider: string): string => {
    switch(provider) {
      case 'openai': return 'OpenAI';
      case 'anthropic': return 'Claude';
      case 'gemini': return 'Gemini';
      case 'mistral': return 'Mistral';
      default: return provider;
    }
  };

  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/70">Using:</span>
        <ProviderStatusIndicator selectedProvider={aiProvider} />
      </div>
      
      <div className="flex items-center gap-1">
        {availableProviders.length > 0 ? (
          availableProviders.map((provider) => (
            <button
              key={provider}
              className={`px-3 py-1 text-xs rounded-full ${
                aiProvider === provider 
                  ? 'bg-neon-purple text-white' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              onClick={() => setAiProvider(provider as AiProvider)}
            >
              {getProviderDisplayName(provider)}
            </button>
          ))
        ) : (
          ['openai', 'anthropic', 'gemini', 'mistral'].map((provider) => (
            <button
              key={provider}
              className="px-3 py-1 text-xs rounded-full bg-white/5 text-white/40 cursor-not-allowed"
              disabled
            >
              {getProviderDisplayName(provider)}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
