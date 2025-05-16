
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Zap, Server, Key, AlertTriangle, Bell, Check, Binary } from 'lucide-react';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';
import { getApiKey } from '@/services/apiKeyService';
import { testApiKey } from '@/services/apiKeys/testing';
import { toast } from 'sonner';

interface DefaultAiProviderSelectorProps {
  defaultAiProvider?: 'openai' | 'anthropic' | 'gemini' | 'mistral';
  onDefaultAiProviderChange: (provider: 'openai' | 'anthropic' | 'gemini' | 'mistral') => void;
}

export function DefaultAiProviderSelector({ 
  defaultAiProvider = 'openai',
  onDefaultAiProviderChange
}: DefaultAiProviderSelectorProps) {
  const [enableFallback, setEnableFallback] = useState<boolean>(false);
  const [providerStatus, setProviderStatus] = useState<Record<string, boolean>>({
    openai: false,
    anthropic: false,
    gemini: false,
    mistral: false
  });
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
  
  // Load fallback preference
  useEffect(() => {
    const fallbackEnabled = getUserPreference('enableAiFallback');
    setEnableFallback(fallbackEnabled === true);
    
    // Check the status of each provider
    checkProviderStatus();
  }, []);
  
  // Check if API keys are configured and working
  const checkProviderStatus = async () => {
    setCheckingStatus(true);
    
    const providers = ['openai', 'anthropic', 'gemini', 'mistral'];
    const statusResults: Record<string, boolean> = {
      openai: false,
      anthropic: false,
      gemini: false,
      mistral: false
    };
    
    for (const provider of providers) {
      try {
        const apiKey = await getApiKey(provider);
        if (apiKey) {
          try {
            const testResult = await testApiKey(provider, apiKey);
            statusResults[provider] = testResult;
          } catch (error) {
            console.error(`Error testing ${provider} API key:`, error);
            statusResults[provider] = false;
          }
        }
      } catch (error) {
        console.error(`Error checking ${provider} API key:`, error);
      }
    }
    
    setProviderStatus(statusResults);
    setCheckingStatus(false);
  };
  
  // Handle toggle for fallback
  const handleFallbackToggle = async (checked: boolean) => {
    setEnableFallback(checked);
    const success = await saveUserPreference('enableAiFallback', checked);
    if (success) {
      toast.success(`AI Provider fallback ${checked ? 'enabled' : 'disabled'}`);
    }
  };

  // Get provider icon and status badge
  const getProviderDetails = (provider: string) => {
    let icon;
    let statusBadge;
    
    // Icon based on provider
    switch (provider) {
      case 'openai':
        icon = <Zap className="h-4 w-4 text-blue-400" />;
        break;
      case 'anthropic':
        icon = <Server className="h-4 w-4 text-purple-400" />;
        break;
      case 'gemini':
        icon = <Key className="h-4 w-4 text-emerald-400" />;
        break;
      case 'mistral':
        icon = <Binary className="h-4 w-4 text-indigo-400" />;
        break;
      default:
        icon = <Bell className="h-4 w-4 text-gray-400" />;
    }
    
    // Status badge based on API key status
    if (checkingStatus) {
      statusBadge = <Badge variant="outline" className="ml-2 text-xs">Checking...</Badge>;
    } else if (providerStatus[provider]) {
      statusBadge = (
        <Badge variant="outline" className="ml-2 text-xs bg-green-950/30 text-green-400 border-green-400/30">
          <Check className="h-3 w-3 mr-1" /> Ready
        </Badge>
      );
    } else {
      statusBadge = (
        <Badge variant="outline" className="ml-2 text-xs bg-amber-950/30 text-amber-400 border-amber-400/30">
          <AlertTriangle className="h-3 w-3 mr-1" /> Not configured
        </Badge>
      );
    }
    
    return { icon, statusBadge };
  };
  
  return (
    <Card className="border-white/10 bg-glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Default AI Provider</CardTitle>
        <CardDescription>
          Select which AI provider should be used by default across the application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={defaultAiProvider}
          onValueChange={(value) => onDefaultAiProviderChange(value as 'openai' | 'anthropic' | 'gemini' | 'mistral')}
          className="flex flex-col sm:flex-row gap-4 flex-wrap"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="openai" id="openai" />
            <Label htmlFor="openai" className="flex items-center gap-2 cursor-pointer">
              {getProviderDetails('openai').icon}
              <span>OpenAI</span>
              {getProviderDetails('openai').statusBadge}
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="anthropic" id="anthropic" />
            <Label htmlFor="anthropic" className="flex items-center gap-2 cursor-pointer">
              {getProviderDetails('anthropic').icon}
              <span>Claude</span>
              {getProviderDetails('anthropic').statusBadge}
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="gemini" id="gemini" />
            <Label htmlFor="gemini" className="flex items-center gap-2 cursor-pointer">
              {getProviderDetails('gemini').icon}
              <span>Gemini</span>
              {getProviderDetails('gemini').statusBadge}
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mistral" id="mistral" />
            <Label htmlFor="mistral" className="flex items-center gap-2 cursor-pointer">
              {getProviderDetails('mistral').icon}
              <span>Mistral</span>
              {getProviderDetails('mistral').statusBadge}
            </Label>
          </div>
        </RadioGroup>
        
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-white/10">
          <Switch 
            id="enable-fallback" 
            checked={enableFallback}
            onCheckedChange={handleFallbackToggle}
          />
          <Label htmlFor="enable-fallback">
            <div>
              <span className="font-medium">Enable AI Provider Fallback</span>
              <p className="text-xs text-muted-foreground mt-1">
                If enabled, the app will try alternative AI providers when your primary choice fails
              </p>
            </div>
          </Label>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 inline-block mr-1 text-amber-400" />
            <span>When a provider fails due to quota limits or API errors, the system will attempt to use your other configured providers as fallbacks if enabled above.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
