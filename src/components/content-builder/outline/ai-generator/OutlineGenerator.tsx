import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand, Loader2 } from 'lucide-react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

export function OutlineGenerator() {
  const { state, dispatch } = useContentBuilder();
  const { mainKeyword } = state;
  const [outlinePrompt, setOutlinePrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateOutline = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const generatedOutline = [
      'Introduction to ' + mainKeyword,
      'Understanding the Basics',
      'Advanced Techniques',
      'Common Mistakes to Avoid',
      'Tools and Resources',
      'Conclusion'
    ];
    dispatch({ type: 'SET_OUTLINE', payload: generatedOutline });
    setIsLoading(false);
  };

  return (
    <div className="space-y-4 p-4">
      <h4 className="text-sm font-medium">AI Outline Generator</h4>
      <Textarea
        placeholder="Enter a detailed prompt to generate an outline"
        value={outlinePrompt}
        onChange={(e) => setOutlinePrompt(e.target.value)}
        className="bg-black/40 border-white/10 text-white"
      />
      <Button
        onClick={handleGenerateOutline}
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand className="mr-2 h-4 w-4" />
            Generate Outline
          </>
        )}
      </Button>
    </div>
  );
}

