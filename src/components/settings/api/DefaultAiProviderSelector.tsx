
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Zap, Server, Key, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface DefaultAiProviderSelectorProps {
  defaultAiProvider?: 'openai' | 'anthropic' | 'gemini';
  onDefaultAiProviderChange: (provider: 'openai' | 'anthropic' | 'gemini') => void;
  enableFallback: boolean;
  setEnableFallback: (enabled: boolean) => void;
  configuredProviders: {[key: string]: boolean};
}

export function DefaultAiProviderSelector({ 
  defaultAiProvider = 'openai',
  onDefaultAiProviderChange,
  enableFallback,
  setEnableFallback,
  configuredProviders
}: DefaultAiProviderSelectorProps) {
  
  // Handle toggle for fallback
  const handleFallbackToggle = async (checked: boolean) => {
    setEnableFallback(checked);
    const success = await saveUserPreference('enableAiFallback', checked);
    if (success) {
      toast.success(`AI Provider fallback ${checked ? 'enabled' : 'disabled'}`);
    }
  };
  
  return (
    <Card className="border-white/10 bg-glass border-gradient">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          Default AI Provider
          <Badge variant="outline" className="ml-2 text-xs font-normal bg-indigo-500/10 border-indigo-500/30 text-indigo-300">
            Primary Selection
          </Badge>
        </CardTitle>
        <CardDescription>
          Select which AI provider should be used by default for content generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={defaultAiProvider}
          onValueChange={(value) => onDefaultAiProviderChange(value as 'openai' | 'anthropic' | 'gemini')}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
            configuredProviders?.openai 
              ? 'opacity-100 hover:bg-white/5' 
              : 'opacity-70 cursor-not-allowed'
          }`}>
            <RadioGroupItem 
              value="openai" 
              id="openai" 
              disabled={!configuredProviders?.openai}
            />
            <Label 
              htmlFor="openai" 
              className={`flex items-center gap-2 ${configuredProviders?.openai ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              <div className="p-1.5 rounded-md bg-blue-500/20">
                <Zap className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <span className="font-medium">OpenAI</span>
                {!configuredProviders?.openai && (
                  <p className="text-xs text-muted-foreground">API key not configured</p>
                )}
              </div>
              {configuredProviders?.openai && (
                <CheckCircle className="h-3.5 w-3.5 text-green-400 ml-1" />
              )}
            </Label>
          </div>
          
          <div className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
            configuredProviders?.anthropic 
              ? 'opacity-100 hover:bg-white/5' 
              : 'opacity-70 cursor-not-allowed'
          }`}>
            <RadioGroupItem 
              value="anthropic" 
              id="anthropic" 
              disabled={!configuredProviders?.anthropic}
            />
            <Label 
              htmlFor="anthropic" 
              className={`flex items-center gap-2 ${configuredProviders?.anthropic ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              <div className="p-1.5 rounded-md bg-purple-500/20">
                <Server className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <span className="font-medium">Claude</span>
                {!configuredProviders?.anthropic && (
                  <p className="text-xs text-muted-foreground">API key not configured</p>
                )}
              </div>
              {configuredProviders?.anthropic && (
                <CheckCircle className="h-3.5 w-3.5 text-green-400 ml-1" />
              )}
            </Label>
          </div>
          
          <div className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
            configuredProviders?.gemini 
              ? 'opacity-100 hover:bg-white/5' 
              : 'opacity-70 cursor-not-allowed'
          }`}>
            <RadioGroupItem 
              value="gemini" 
              id="gemini" 
              disabled={!configuredProviders?.gemini}
            />
            <Label 
              htmlFor="gemini" 
              className={`flex items-center gap-2 ${configuredProviders?.gemini ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              <div className="p-1.5 rounded-md bg-emerald-500/20">
                <Key className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <span className="font-medium">Gemini</span>
                {!configuredProviders?.gemini && (
                  <p className="text-xs text-muted-foreground">API key not configured</p>
                )}
              </div>
              {configuredProviders?.gemini && (
                <CheckCircle className="h-3.5 w-3.5 text-green-400 ml-1" />
              )}
            </Label>
          </div>
        </RadioGroup>
        
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-white/10">
          <Switch 
            id="enable-fallback" 
            checked={enableFallback}
            onCheckedChange={handleFallbackToggle}
          />
          <Label htmlFor="enable-fallback" className="flex items-start gap-2">
            <div>
              <span className="font-medium">Enable AI Provider Fallback</span>
              <p className="text-xs text-muted-foreground mt-1">
                If enabled, the app will try alternative AI providers when your primary choice fails
              </p>
            </div>
            <div className="cursor-help group relative">
              <Info className="h-4 w-4 text-muted-foreground" />
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 p-2 bg-popover rounded-md shadow-lg text-xs hidden group-hover:block z-50">
                When enabled, if the default AI provider fails, the system will automatically try other configured providers in this order: OpenAI, Claude, then Gemini.
              </div>
            </div>
          </Label>
        </div>

        {enableFallback && (
          <div className="mt-4 p-3 bg-amber-950/20 border border-amber-500/30 rounded-md">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-300">Fallback is enabled</p>
                <p className="text-xs text-amber-300/80 mt-1">
                  Make sure you have multiple AI providers configured for fallback to work properly.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
