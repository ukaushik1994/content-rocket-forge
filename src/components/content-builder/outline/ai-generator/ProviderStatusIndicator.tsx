
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getFallbackConfig } from '@/services/aiService/providerFallback';
import { Zap, Server, Key, Binary } from 'lucide-react';
import { getUserPreference } from '@/services/userPreferencesService';

type AiProvider = 'openai' | 'anthropic' | 'gemini' | 'mistral';

interface ProviderStatusIndicatorProps {
  selectedProvider: AiProvider;
  size?: 'sm' | 'md';
  showFallbackIndicator?: boolean;
}

export function ProviderStatusIndicator({ 
  selectedProvider,
  size = 'md',
  showFallbackIndicator = true 
}: ProviderStatusIndicatorProps) {
  const { enabled: fallbackEnabled } = getFallbackConfig();
  const defaultProvider = getUserPreference('defaultAiProvider') as AiProvider || 'openai';
  const isFallbackActive = fallbackEnabled && showFallbackIndicator && selectedProvider !== defaultProvider;
  
  const getProviderIcon = (provider: AiProvider) => {
    switch(provider) {
      case 'openai': return <Zap className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />;
      case 'anthropic': return <Server className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />;
      case 'gemini': return <Key className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />;
      case 'mistral': return <Binary className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />;
    }
  };
  
  const getProviderName = (provider: AiProvider) => {
    switch(provider) {
      case 'openai': return 'OpenAI';
      case 'anthropic': return 'Claude';
      case 'gemini': return 'Gemini';
      case 'mistral': return 'Mistral';
    }
  };
  
  const getProviderColor = (provider: AiProvider) => {
    switch(provider) {
      case 'openai': return 'bg-blue-900/20 text-blue-400 border-blue-500/30';
      case 'anthropic': return 'bg-purple-900/20 text-purple-400 border-purple-500/30';
      case 'gemini': return 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30';
      case 'mistral': return 'bg-indigo-900/20 text-indigo-400 border-indigo-500/30';
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Badge 
        variant="outline" 
        className={`${getProviderColor(selectedProvider)} ${size === 'sm' ? 'text-xs px-1.5 py-0' : ''}`}
      >
        <span className="flex items-center gap-1">
          {getProviderIcon(selectedProvider)}
          <span>{getProviderName(selectedProvider)}</span>
        </span>
      </Badge>
      
      {isFallbackActive && (
        <Badge 
          variant="outline" 
          className="bg-amber-900/20 text-amber-400 border-amber-400/30 text-xs px-1.5 py-0"
        >
          Fallback
        </Badge>
      )}
    </div>
  );
}
