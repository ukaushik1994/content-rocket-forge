
import React from 'react';

type AiProvider = 'openai' | 'anthropic' | 'gemini';

interface AiProviderSelectorProps {
  aiProvider: AiProvider;
  setAiProvider: (provider: AiProvider) => void;
}

export function AiProviderSelector({ aiProvider, setAiProvider }: AiProviderSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-white/70">AI Provider:</span>
      <div className="flex items-center gap-1">
        {['openai', 'anthropic', 'gemini'].map((provider) => (
          <button
            key={provider}
            className={`px-3 py-1 text-xs rounded-full ${
              aiProvider === provider 
                ? 'bg-neon-purple text-white' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
            onClick={() => setAiProvider(provider as AiProvider)}
          >
            {provider === 'openai' ? 'OpenAI' : 
             provider === 'anthropic' ? 'Claude' : 'Gemini'}
          </button>
        ))}
      </div>
    </div>
  );
}
