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
    const storedAi = getUserPreference('defaultAiProvider') as AiProvider || 'openrouter';
    setAiProvider(storedAi);
    const storedSerp = getUserPreference('defaultSerpProvider') as SerpProvider || 'serp';
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
  return;
}