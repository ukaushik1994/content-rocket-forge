
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeywordSearch } from '@/components/content-builder/keyword/KeywordSearch';
import { Button } from '@/components/ui/button';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { InitialStateView } from './InitialStateView';
import { SelectedKeywords } from './SelectedKeywords';
import { SerpAnalysisResult } from '@/types/serp';

interface KeywordSelectionContentProps {
  mainKeyword: string;
  selectedKeywords: string[];
  suggestions: string[];
  hasSearched: boolean;
  serpData: SerpAnalysisResult | null;
  isAnalyzing: boolean;
  onSearch: (keyword: string, suggestions: string[]) => void;
  onAddKeyword: (keyword: string) => void;
  onRemoveKeyword: (keyword: string) => void;
  onAddToContent: () => void;
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
  onAddToContent,
  onReanalyze
}) => {
  if (!hasSearched && suggestions.length === 0) {
    return <InitialStateView onSearch={onSearch} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Keyword Research</CardTitle>
          <CardDescription>
            Search for your main keyword and select related keywords to include in your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <KeywordSearch
            onSearch={onSearch}
            defaultKeyword={mainKeyword}
            placeholder="Search for a keyword"
            buttonText="Research"
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Selected Keywords</h3>
              <Button 
                size="sm" 
                onClick={onAddToContent}
                disabled={selectedKeywords.length === 0}
                className="h-8"
              >
                Continue with Selected
              </Button>
            </div>
            
            <SelectedKeywords 
              keywords={selectedKeywords}
              onRemoveKeyword={onRemoveKeyword}
            />
          </div>

          {hasSearched && suggestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Suggested Keywords</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onReanalyze}
                  disabled={isAnalyzing || !mainKeyword}
                  className="h-8"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {suggestions.map((keyword) => (
                  <Button
                    key={keyword}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 h-8"
                    onClick={() => onAddKeyword(keyword)}
                    disabled={selectedKeywords.includes(keyword)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {keyword}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
