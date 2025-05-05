import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Zap, Server, Key } from 'lucide-react';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';
import { toast } from 'sonner';

interface DefaultAiProviderSelectorProps {
  defaultAiProvider?: 'openai' | 'anthropic' | 'gemini';
  onDefaultAiProviderChange: (provider: 'openai' | 'anthropic' | 'gemini') => void;
}

export function DefaultAiProviderSelector({ 
  defaultAiProvider = 'openai',
  onDefaultAiProviderChange
}: DefaultAiProviderSelectorProps) {
  const [enableFallback, setEnableFallback] = useState<boolean>(false);
  
  // Load fallback preference
  useEffect(() => {
    const fallbackEnabled = getUserPreference('enableAiFallback');
    setEnableFallback(fallbackEnabled === true);
  }, []);
  
  // Handle toggle for fallback
  const handleFallbackToggle = async (checked: boolean) => {
    setEnableFallback(checked);
    const success = await saveUserPreference('enableAiFallback', checked);
    if (success) {
      toast.success(`AI Provider fallback ${checked ? 'enabled' : 'disabled'}`);
    }
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
          onValueChange={(value) => onDefaultAiProviderChange(value as 'openai' | 'anthropic' | 'gemini')}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="openai" id="openai" />
            <Label htmlFor="openai" className="flex items-center gap-2 cursor-pointer">
              <Zap className="h-4 w-4 text-blue-400" />
              OpenAI
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="anthropic" id="anthropic" />
            <Label htmlFor="anthropic" className="flex items-center gap-2 cursor-pointer">
              <Server className="h-4 w-4 text-purple-400" />
              Claude
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="gemini" id="gemini" />
            <Label htmlFor="gemini" className="flex items-center gap-2 cursor-pointer">
              <Key className="h-4 w-4 text-emerald-400" />
              Gemini
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
      </CardContent>
    </Card>
  );
}
