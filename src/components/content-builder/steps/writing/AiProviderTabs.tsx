
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AiProviderTabsProps {
  selectedProvider: string;
  onSelectProvider: (provider: string) => void;
}

export const AiProviderTabs: React.FC<AiProviderTabsProps> = ({
  selectedProvider,
  onSelectProvider
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">AI Provider</h3>
      <Tabs defaultValue={selectedProvider} onValueChange={onSelectProvider} className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-white/5">
          <TabsTrigger value="openai" className="data-[state=active]:bg-white/10">
            <span className="flex items-center gap-1.5">
              <img src="/icons/openai-logo.svg" alt="OpenAI" className="w-4 h-4" />
              OpenAI
            </span>
          </TabsTrigger>
          <TabsTrigger value="anthropic" className="data-[state=active]:bg-white/10">
            <span className="flex items-center gap-1.5">
              <img src="/icons/anthropic-logo.svg" alt="Anthropic" className="w-4 h-4" />
              Claude
            </span>
          </TabsTrigger>
          <TabsTrigger value="gemini" className="data-[state=active]:bg-white/10">
            <span className="flex items-center gap-1.5">
              <img src="/icons/gemini-logo.svg" alt="Gemini" className="w-4 h-4" />
              Gemini
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
