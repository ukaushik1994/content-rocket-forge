
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeywordSearch } from '@/components/content-builder/keyword/KeywordSearch';
import { SelectedKeywords } from './SelectedKeywords';
import { InitialStateView } from './InitialStateView';
import { Loader2, RefreshCw } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';

export interface KeywordSelectionContentProps {
  mainKeyword: string;
  selectedKeywords: string[];
  suggestions: string[];
  hasSearched: boolean;
  serpData: SerpAnalysisResult | null;
  isAnalyzing: boolean;
  onSearch: (keyword: string, suggestions: string[]) => void;
  onAddKeyword: (keyword: string) => void;
  onRemoveKeyword: (keyword: string) => void;
  onToggleSelection?: (type: string, content: string) => void;
  onAddToContent: (content: string, type: string) => void;
  onReanalyze: () => void;
}

export const KeywordSelectionContent: React.FC<KeywordSelectionContentProps> = ({
  mainKeyword,
  selectedKeywords,
  suggestions,
  hasSearched,
  serpData,
  isAnalyzing,
  onSearch,
  onAddKeyword,
  onRemoveKeyword,
  onToggleSelection,
  onAddToContent,
  onReanalyze
}) => {
  // Render suggestions if available
  const renderSuggestions = () => {
    if (!suggestions || suggestions.length === 0) {
      return null;
    }

    return (
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-3">Related Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => onAddKeyword(suggestion)}
              className="text-xs"
              disabled={selectedKeywords.includes(suggestion)}
            >
              {suggestion}
              {selectedKeywords.includes(suggestion) && " ✓"}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  // Render the main content
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Keywords</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-medium">Main Keyword</label>
            <KeywordSearch
              onSearch={onSearch}
              defaultKeyword={mainKeyword}
              placeholder="Enter your main keyword"
              buttonText="Search"
            />
          </div>
          
          {hasSearched ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Selected Keywords</h3>
                  {isAnalyzing ? (
                    <Button variant="ghost" size="sm" disabled className="text-xs">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Analyzing...
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onReanalyze}
                      className="text-xs"
                      disabled={!mainKeyword}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh Analysis
                    </Button>
                  )}
                </div>
                <SelectedKeywords 
                  keywords={selectedKeywords}
                  onRemoveKeyword={onRemoveKeyword}
                />
              </div>
              
              {renderSuggestions()}
            </>
          ) : (
            <InitialStateView onSearch={onSearch} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
