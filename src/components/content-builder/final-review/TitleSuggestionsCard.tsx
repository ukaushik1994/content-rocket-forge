
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface TitleSuggestionsCardProps {
  currentTitle: string | null;
  mainKeyword: string;
  selectedKeywords: string[];
  onSelectTitle: (title: string) => void;
  generateNewTitles: () => void;
  suggestions: string[];
  isGenerating: boolean;
}

export const TitleSuggestionsCard = ({
  currentTitle,
  mainKeyword,
  selectedKeywords,
  onSelectTitle,
  generateNewTitles,
  suggestions,
  isGenerating
}: TitleSuggestionsCardProps) => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelectTitle = (index: number) => {
    setSelected(index);
    const selectedTitle = suggestions[index];
    onSelectTitle(selectedTitle);
    toast.success("Title updated successfully");
    
    // Log to verify the title is being selected correctly
    console.log("Title selected:", selectedTitle);
  };

  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
          Title Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Current Title */}
        {currentTitle && (
          <div className="mb-4 pb-3 border-b border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Current Title:</p>
            <p className="text-sm font-medium">{currentTitle}</p>
          </div>
        )}

        {/* Title Suggestions */}
        <div className="space-y-2 mb-4">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-md border cursor-pointer transition-colors ${
                  selected === index 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-border/50 hover:bg-secondary/30'
                }`}
                onClick={() => handleSelectTitle(index)}
              >
                <div className="flex justify-between items-center gap-2">
                  <p className="text-sm">{suggestion}</p>
                  {selected === index && (
                    <Check className="h-4 w-4 text-purple-500" />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm">No title suggestions generated yet.</p>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <Button
            onClick={generateNewTitles}
            disabled={isGenerating}
            variant="outline"
            size="sm"
            className="gap-2 border-purple-500/30 hover:bg-purple-500/10"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Generate New Titles
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
