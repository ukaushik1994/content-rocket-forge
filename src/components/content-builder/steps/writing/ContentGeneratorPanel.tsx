
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SerpContentGenerator } from '@/components/content/SerpContentGenerator';
import { ContentInstructions } from './ContentInstructions';
import { AiProviderTabs } from './AiProviderTabs';

export const ContentGeneratorPanel = () => {
  const { state, setContent } = useContentBuilder();
  const { mainKeyword, serpData, serpSelections, contentType } = state;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedAiProvider, setSelectedAiProvider] = useState('openai');
  
  // Handle AI content generation
  const handleGenerateContent = (template: string) => {
    // In a real implementation, this would call an API endpoint
    setIsGenerating(true);
    
    setTimeout(() => {
      // Simulate AI generation
      setContent(template);
      setIsGenerating(false);
    }, 1500);
  };
  
  // Calculate how many SERP items are selected
  const selectedSerpItems = serpSelections.filter(item => item.selected).length;
  
  return (
    <Card className="border-neon-purple/20 bg-gradient-to-br from-indigo-950/20 to-black/30">
      <CardHeader className="pb-3 border-b border-white/10">
        <CardTitle className="text-sm font-medium flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-neon-purple" />
          Content Generator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-4">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-neon-purple mb-4" />
            <p className="text-center text-white/70">
              Generating content based on your outline and {selectedSerpItems} selected SERP items...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AiProviderTabs 
              selectedProvider={selectedAiProvider}
              onSelectProvider={setSelectedAiProvider}
            />
            
            <ContentInstructions 
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
              mainKeyword={mainKeyword}
              contentType={contentType}
              selectedSerpItems={selectedSerpItems}
            />
            
            {/* Templates based on SERP data */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Content Templates</h3>
              <SerpContentGenerator 
                serpData={serpData} 
                onGenerateContent={handleGenerateContent} 
                mainKeyword={mainKeyword} 
              />
            </div>
            
            <Button 
              onClick={() => handleGenerateContent(customPrompt)}
              className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Custom Content
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
