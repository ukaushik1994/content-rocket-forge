import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getUserPreference } from '@/services/userPreferencesService';
import { isProviderAvailable } from '@/services/providerAvailabilityService';
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

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  useEffect(() => {
    const checkAiServiceStatus = async () => {
      try {
        const defaultProvider = getUserPreference('defaultAiProvider') as AiProvider || 'openrouter';
        const available = await isProviderAvailable(defaultProvider);
        setIsOnline(available);
      } catch (error) {
        console.error('Error checking AI service status:', error);
        setIsOnline(false);
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
          <p>AI Service: {isOnline ? 'Online' : 'Offline'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}