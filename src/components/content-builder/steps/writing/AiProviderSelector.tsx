
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AiProvider } from '@/services/aiService/types';
import { toast } from 'sonner';

interface AiProviderSelectorProps {
  selectedProvider: AiProvider;
  onChange: (provider: AiProvider) => void;
  disabled?: boolean;
}

export const AiProviderSelector: React.FC<AiProviderSelectorProps> = ({ 
  selectedProvider, 
  onChange,
  disabled = false
}) => {
  const handleProviderChange = (value: string) => {
    const provider = value as AiProvider;
    onChange(provider);
    toast.info(`AI provider changed to ${provider}`);
  };

  return (
    <Select 
      value={selectedProvider} 
      onValueChange={handleProviderChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
        <SelectValue placeholder="Select AI model" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
        <SelectItem value="gpt-4">GPT-4</SelectItem>
        <SelectItem value="gpt-3.5-turbo">GPT-3.5</SelectItem>
        <SelectItem value="claude-3">Claude 3</SelectItem>
        <SelectItem value="anthropic">Anthropic</SelectItem>
        <SelectItem value="openai">OpenAI</SelectItem>
        <SelectItem value="gemini">Gemini</SelectItem>
      </SelectContent>
    </Select>
  );
};
