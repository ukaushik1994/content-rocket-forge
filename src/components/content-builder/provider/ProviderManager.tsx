import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle, AlertCircle, Clock, ChevronDown, Settings, Wifi, WifiOff } from 'lucide-react';
import { AiProvider } from '@/services/aiService/types';
import AIServiceController from '@/services/aiService/AIServiceController';
import { useSettings } from '@/contexts/SettingsContext';

interface ProviderManagerProps {
  selectedProvider: AiProvider;
  onProviderChange: (provider: AiProvider) => void;
  className?: string;
  showStatus?: boolean;
}

export function ProviderManager({ 
  selectedProvider, 
  onProviderChange, 
  className = '',
  showStatus = true 
}: ProviderManagerProps) {
  const [availableProviders, setAvailableProviders] = useState<AiProvider[]>([]);
  const [providerStatus, setProviderStatus] = useState<Record<AiProvider, boolean>>({} as Record<AiProvider, boolean>);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { openSettings } = useSettings();

  // Load available providers on mount
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading providers...');
      
      // Clear cache and get fresh data
      AIServiceController.clearCache();
      const activeProviders = await AIServiceController.getActiveProviders();
      
      console.log('📊 Loaded providers:', activeProviders.map(p => ({ 
        provider: p.provider, 
        status: p.status, 
        error: p.error_message 
      })));
      
      const available = activeProviders.map(p => p.provider as AiProvider);
      
      // Create status map based on provider status
      const status: Record<AiProvider, boolean> = {} as Record<AiProvider, boolean>;
      activeProviders.forEach(provider => {
        status[provider.provider as AiProvider] = provider.status === 'active';
      });
      
      setAvailableProviders(available);
      setProviderStatus(status);

      // Auto-select working provider if none selected or current is not working
      const workingProviders = activeProviders.filter(p => p.status === 'active');
      if (workingProviders.length > 0) {
        if (!selectedProvider || !status[selectedProvider]) {
          const bestProvider = workingProviders.sort((a, b) => a.priority - b.priority)[0];
          onProviderChange(bestProvider.provider as AiProvider);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load providers:', error);
      setAvailableProviders([]);
      setProviderStatus({} as Record<AiProvider, boolean>);
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderDisplayName = (provider: AiProvider): string => {
    const names = {
      openrouter: 'OpenRouter',
      openai: 'OpenAI',
      anthropic: 'Claude',
      gemini: 'Gemini',
      mistral: 'Mistral',
      lmstudio: 'LM Studio'
    };
    return names[provider] || provider;
  };

  const getProviderIcon = (provider: AiProvider, isWorking: boolean) => {
    if (isLoading) return <Clock className="h-4 w-4 animate-spin" />;
    return isWorking ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-amber-500" />
    );
  };

  const currentProviderWorking = providerStatus[selectedProvider] ?? false;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showStatus && (
        <div className="flex items-center gap-1">
          {currentProviderWorking ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-amber-500" />
          )}
          <span className="text-xs text-muted-foreground">
            {availableProviders.length} provider{availableProviders.length !== 1 ? 's' : ''} available
          </span>
        </div>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-background/50 backdrop-blur-sm border-border/60 hover:border-primary/50"
          >
            {getProviderIcon(selectedProvider, currentProviderWorking)}
            <span className="font-medium">{getProviderDisplayName(selectedProvider)}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b border-border">
            <h4 className="font-semibold text-sm mb-1">AI Provider Selection</h4>
            <p className="text-xs text-muted-foreground">
              Choose your preferred AI service for content generation
            </p>
          </div>
          
          <div className="p-2">
            {availableProviders.length > 0 ? (
              <div className="space-y-1">
                {availableProviders.map((provider) => {
                  const isWorking = providerStatus[provider] ?? false;
                  const isSelected = provider === selectedProvider;
                  
                  return (
                    <button
                      key={provider}
                      onClick={() => {
                        onProviderChange(provider);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all hover:bg-accent/50 ${
                        isSelected ? 'bg-primary/10 border-primary/30' : 'border-border/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getProviderIcon(provider, isWorking)}
                        <div>
                          <div className="font-medium text-sm">{getProviderDisplayName(provider)}</div>
                          <div className="text-xs text-muted-foreground">
                            {provider === 'openrouter' && 'Multiple models, cost-effective'}
                            {provider === 'openai' && 'GPT models, reliable'}
                            {provider === 'anthropic' && 'Claude models, thoughtful'}
                            {provider === 'gemini' && 'Google models, fast'}
                            {provider === 'mistral' && 'Open source, efficient'}
                            {provider === 'lmstudio' && 'Local models, private'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {provider === 'openrouter' && (
                          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/20 to-secondary/20">
                            Recommended
                          </Badge>
                        )}
                        {isSelected && (
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  No AI providers configured
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openSettings('api')}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configure APIs
                </Button>
              </div>
            )}
          </div>
          
          {availableProviders.length > 0 && (
            <div className="p-3 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {availableProviders.filter(p => providerStatus[p]).length} working providers
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={loadProviders}
                  disabled={isLoading}
                  className="h-6 px-2 text-xs"
                >
                  {isLoading ? 'Refreshing...' : 'Refresh Status'}
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}