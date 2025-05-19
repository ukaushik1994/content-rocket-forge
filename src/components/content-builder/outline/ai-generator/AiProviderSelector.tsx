
import React from 'react';
import { ProviderStatusIndicator } from './ProviderStatusIndicator';

export type AiProvider = 'openai' | 'anthropic' | 'gemini' | 'mistral';

export interface AiProviderSelectorProps {
  aiProvider: AiProvider;
  setAiProvider: (provider: AiProvider) => void;
  availableProviders?: AiProvider[];
  // Added these props to fix the type error
  selectedProvider?: AiProvider;
  onProviderChange?: (provider: AiProvider) => void;
  size?: string;
  variant?: string;
  className?: string;
}

export function AiProviderSelector({ 
  aiProvider, 
  setAiProvider,
  availableProviders = ['openai', 'anthropic', 'gemini', 'mistral'],
  selectedProvider, // Added for backward compatibility
  onProviderChange, // Added for backward compatibility
  size,
  variant,
  className
}: AiProviderSelectorProps) {
  // If selectedProvider is provided, use it instead of aiProvider
  const provider = selectedProvider || aiProvider;
  // If onProviderChange is provided, use it instead of setAiProvider
  const handleProviderChange = onProviderChange || setAiProvider;
  
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
    <div className={`flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 ${className || ''}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/70">Using:</span>
        <ProviderStatusIndicator selectedProvider={provider} />
      </div>
      
      <div className="flex items-center gap-1">
        {availableProviders.length > 0 ? (
          availableProviders.map((providerOption) => (
            <button
              key={providerOption}
              className={`px-3 py-1 text-xs rounded-full ${
                provider === providerOption 
                  ? 'bg-neon-purple text-white' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              onClick={() => handleProviderChange(providerOption as AiProvider)}
            >
              {getProviderDisplayName(providerOption)}
            </button>
          ))
        ) : (
          ['openai', 'anthropic', 'gemini', 'mistral'].map((providerOption) => (
            <button
              key={providerOption}
              className="px-3 py-1 text-xs rounded-full bg-white/5 text-white/40 cursor-not-allowed"
              disabled
            >
              {getProviderDisplayName(providerOption)}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
