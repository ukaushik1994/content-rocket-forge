
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AiProvider } from '@/services/aiService/types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface DefaultAiProviderSelectorProps {
  defaultAiProvider?: AiProvider;
  onDefaultAiProviderChange: (provider: AiProvider) => void;
}

export function DefaultAiProviderSelector({
  defaultAiProvider = 'openai',
  onDefaultAiProviderChange,
}: DefaultAiProviderSelectorProps) {
  return (
    <Card className="border-border/40">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium">Default AI Provider</h3>
            <p className="text-sm text-muted-foreground">
              Choose which AI provider to use by default for content generation
            </p>
          </div>
          
          <RadioGroup
            value={defaultAiProvider}
            onValueChange={(value) => onDefaultAiProviderChange(value as AiProvider)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="openai" id="openai" />
              <Label htmlFor="openai" className="cursor-pointer">OpenAI</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gemini" id="gemini" />
              <Label htmlFor="gemini" className="cursor-pointer">Google Gemini</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
