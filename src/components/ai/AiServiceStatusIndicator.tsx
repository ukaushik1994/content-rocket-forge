import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getUserPreference } from '@/services/userPreferencesService';
import { getAvailableProviders, getProviderStatus } from '@/services/providerAvailabilityService';
import { AiProvider } from '@/services/aiService/types';

interface AiServiceStatusIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AiServiceStatusIndicator({ 
  size = 'md',
  className = '' 
}: AiServiceStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableProviders, setAvailableProviders] = useState<AiProvider[]>([]);
  const [activeProvider, setActiveProvider] = useState<string>('');

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  useEffect(() => {
    const checkAiServiceStatus = async () => {
      try {
        const available = await getAvailableProviders();
        const status = await getProviderStatus();
        const defaultProvider = getUserPreference('defaultAiProvider') as AiProvider || 'openrouter';
        
        // Check if any providers are working
        const workingProviders = available.filter(provider => status[provider]);
        const isServiceOnline = workingProviders.length > 0;
        
        setAvailableProviders(workingProviders);
        setIsOnline(isServiceOnline);
        setActiveProvider(workingProviders.includes(defaultProvider) ? defaultProvider : workingProviders[0] || 'none');
      } catch (error) {
        console.error('Error checking AI service status:', error);
        setIsOnline(false);
        setAvailableProviders([]);
        setActiveProvider('none');
      } finally {
        setIsLoading(false);
      }
    };

    checkAiServiceStatus();
  }, []);

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-400 rounded-full animate-pulse ${className}`} />
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`${sizeClasses[size]} rounded-full ${className} ${
              isOnline 
                ? 'bg-green-400 shadow-sm shadow-green-400/50' 
                : 'bg-red-400 shadow-sm shadow-red-400/50'
            } ${isOnline ? 'animate-pulse' : ''}`}
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">AI Service: {isOnline ? 'Online' : 'Offline'}</p>
            {isOnline && availableProviders.length > 0 && (
              <div className="mt-1 text-xs">
                <p>Active: {activeProvider === 'openai' ? 'OpenAI' : 
                           activeProvider === 'anthropic' ? 'Claude' : 
                           activeProvider === 'gemini' ? 'Gemini' : 
                           activeProvider === 'mistral' ? 'Mistral' :
                           activeProvider === 'lmstudio' ? 'LM Studio' :
                           activeProvider === 'openrouter' ? 'OpenRouter' : activeProvider}</p>
                <p>{availableProviders.length} provider{availableProviders.length > 1 ? 's' : ''} configured</p>
              </div>
            )}
            {!isOnline && (
              <p className="mt-1 text-xs text-red-300">Configure API keys in Settings</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}