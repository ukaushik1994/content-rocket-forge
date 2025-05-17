
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { generateTitleSuggestions } from '@/utils/seo/titles/generateTitleSuggestions';
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';

export function TitleGenerator() {
  const { state, dispatch } = useContentBuilder();
  const { mainKeyword, selectedKeywords, serpSelections, contentTitle, content } = state;
  
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiProvider] = useState<AiProvider>('openai');

  // Generate titles based on selected SERP items, AI content generation and keywords
  const handleGenerateTitles = async () => {
    if (!mainKeyword) {
      toast.error("Main keyword is required to generate title suggestions");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Get all selected items content as context
      const selectedContent = serpSelections
        .filter(item => item.selected)
        .map(item => item.content)
        .join(" ");
      
      // Try to use AI service first
      try {
        const chatResponse = await sendChatRequest(aiProvider, {
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert at creating compelling SEO-optimized titles.' 
            },
            { 
              role: 'user', 
              content: `Generate 5-8 engaging, SEO-friendly title suggestions for an article about "${mainKeyword}". 
              Secondary keywords to consider: ${selectedKeywords.join(', ')}.
              Content context: ${(selectedContent || content || '').substring(0, 500)}
              Format each title on a new line with no numbering or extra formatting.`
            }
          ],
          temperature: 0.7
        });
        
        if (chatResponse?.choices?.[0]?.message?.content) {
          // Parse the AI response into individual titles
          const aiTitles = chatResponse.choices[0].message.content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[0-9]+\.\s*/, '')) // Remove any numbering
            .slice(0, 8); // Limit to 8 titles
          
          setSuggestedTitles(aiTitles);
          toast.success(`Generated ${aiTitles.length} title suggestions using AI`);
          setIsGenerating(false);
          return;
        }
      } catch (aiError) {
        console.error("AI title generation failed, falling back to template:", aiError);
      }
      
      // Fallback: Generate title suggestions using the utility if AI fails
      const titles = await generateTitleSuggestions(
        selectedContent || content || mainKeyword,
        mainKeyword,
        selectedKeywords
      );
      
      setSuggestedTitles(titles);
      
      if (titles.length > 0) {
        toast.success(`Generated ${titles.length} title suggestions`);
      } else {
        toast.warning("Could not generate title suggestions");
      }
    } catch (error) {
      console.error("Error generating titles:", error);
      toast.error("Failed to generate title suggestions");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Set a title as the content title
  const handleSelectTitle = (title: string) => {
    dispatch({ type: 'SET_CONTENT_TITLE', payload: title });
    toast.success("Title has been set");
  };
  
  return (
    <Card className="bg-white/5 border border-white/10 overflow-hidden">
      <CardHeader className="pb-3 border-b border-white/10 bg-white/5 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-neon-purple" />
          Title Suggestions
        </CardTitle>
        <Button 
          variant="outline"
          size="sm" 
          onClick={handleGenerateTitles}
          disabled={isGenerating}
          className="h-8 flex items-center gap-1 bg-glass border border-white/10"
        >
          {isGenerating ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          <span className="text-xs">{suggestedTitles.length > 0 ? 'Regenerate' : 'Generate'}</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        {suggestedTitles.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                <p>Generating title suggestions...</p>
              </div>
            ) : (
              <p>
                Click "Generate" to create title suggestions based on your selected keywords and SERP insights
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {suggestedTitles.map((title, index) => (
              <div 
                key={index} 
                className={`
                  flex items-center justify-between p-2 rounded-md 
                  ${contentTitle === title 
                    ? 'bg-primary/20 border border-primary/30' 
                    : 'hover:bg-white/5 border border-white/5 hover:border-white/10'
                  } 
                  transition-all cursor-pointer
                `}
                onClick={() => handleSelectTitle(title)}
              >
                <span className="text-sm">{title}</span>
                {contentTitle === title && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
