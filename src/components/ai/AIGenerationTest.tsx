import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import AIServiceController from '@/services/aiService/AIServiceController';

export function AIGenerationTest() {
  const [prompt, setPrompt] = useState('Write a brief introduction about renewable energy');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    try {
      setIsGenerating(true);
      setResult('');

      console.log('🚀 Testing AI generation with prompt:', prompt);
      
      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'content_generation',
        temperature: 0.7,
        max_tokens: 300
      });

      if (response?.content) {
        setResult(response.content);
        toast.success(`Content generated using ${response.provider_used}!`);
      } else {
        toast.error('No content generated - check provider configuration');
      }
    } catch (error: any) {
      console.error('Generation test failed:', error);
      toast.error(`Generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          AI Generation Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Test Prompt
          </label>
          <Input
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to test AI generation..."
            disabled={isGenerating}
          />
        </div>
        
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>

        {result && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Generated Content
            </label>
            <Textarea
              value={result}
              readOnly
              rows={8}
              className="bg-muted/50"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}