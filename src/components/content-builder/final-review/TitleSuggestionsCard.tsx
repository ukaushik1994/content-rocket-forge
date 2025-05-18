
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshButton } from '@/components/ui/refresh-button';
import { Sparkles } from 'lucide-react';

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
  return (
    <Card className="border-blue-500/20 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Title Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-muted-foreground">
              Optimized titles using <span className="font-medium text-blue-500">{mainKeyword}</span>
              {selectedKeywords.length > 0 && ' and secondary keywords'}
            </p>
            <RefreshButton 
              isRefreshing={isGenerating} 
              onClick={generateNewTitles}
              className="text-xs"
            >
              Generate New
            </RefreshButton>
          </div>
          
          {currentTitle && (
            <div className="mb-4 p-3 bg-secondary/20 rounded-md border border-secondary/30">
              <p className="text-xs text-muted-foreground mb-1">Current Title:</p>
              <p className="text-sm font-medium">{currentTitle}</p>
            </div>
          )}
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {isGenerating ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((title, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-md border cursor-pointer hover:bg-secondary/30 transition-all duration-200"
                  onClick={() => onSelectTitle(title)}
                >
                  <p className="text-sm">{title}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No title suggestions available. Click "Generate New" to create some.
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={generateNewTitles} 
            variant="default" 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            disabled={isGenerating}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate More Title Ideas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
