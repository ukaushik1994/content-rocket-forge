import React, { useEffect, useState } from 'react';
import { TourTrigger } from '@/components/tour/TourTrigger';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Brain, Search } from 'lucide-react';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';

// Keep types simple and localized for this toolbar
type AiProvider = 'openrouter' | 'anthropic' | 'openai' | 'gemini' | 'mistral' | 'lmstudio';
type SerpProvider = 'serp' | 'serpstack';

export default function SettingsTopBar() {
  const [aiProvider, setAiProvider] = useState<AiProvider>('openrouter');
  const [serpProvider, setSerpProvider] = useState<SerpProvider>('serp');

  useEffect(() => {
    const storedAi = (getUserPreference('defaultAiProvider') as AiProvider) || 'openrouter';
    setAiProvider(storedAi);
    const storedSerp = (getUserPreference('defaultSerpProvider') as SerpProvider) || 'serp';
    setSerpProvider(storedSerp);
  }, []);

  const handleAiChange = async (value: AiProvider) => {
    setAiProvider(value);
    // Persist as the app-wide default used by fallback logic
    await saveUserPreference('defaultAiProvider', value);
  };

  const handleSerpChange = async (value: SerpProvider) => {
    setSerpProvider(value);
    // Persist new preference for SERP usage
    await saveUserPreference('defaultSerpProvider', value);
  };

  return (
    <div className="w-full bg-glass/40 backdrop-blur supports-[backdrop-filter]:bg-glass/30 border border-white/10 rounded-xl px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Left: Tour trigger */}
      <div className="flex items-center gap-3">
        <TourTrigger variant="inline" size="sm" />
        <Separator orientation="vertical" className="h-6" />
        <span className="text-sm text-muted-foreground hidden sm:inline">
          Quick actions
        </span>
      </div>

      {/* Right: Dropdowns */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="ai-provider" className="text-xs text-muted-foreground">AI</Label>
          <Select value={aiProvider} onValueChange={(v) => handleAiChange(v as AiProvider)}>
            <SelectTrigger id="ai-provider" className="h-8 min-w-[140px]">
              <SelectValue placeholder="Choose AI provider" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="openrouter">OpenRouter</SelectItem>
              <SelectItem value="anthropic">Claude</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="gemini">Gemini</SelectItem>
              <SelectItem value="mistral">Mistral</SelectItem>
              <SelectItem value="lmstudio">LM Studio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="serp-provider" className="text-xs text-muted-foreground">SERP</Label>
          <Select value={serpProvider} onValueChange={(v) => handleSerpChange(v as SerpProvider)}>
            <SelectTrigger id="serp-provider" className="h-8 min-w-[140px]">
              <SelectValue placeholder="Choose SERP provider" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="serp">SerpAPI</SelectItem>
              <SelectItem value="serpstack">Serpstack</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
