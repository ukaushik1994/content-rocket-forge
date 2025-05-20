
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { KeywordSearch } from '@/components/content-builder/keyword/KeywordSearch';
import { SelectedKeywords } from '@/components/content-builder/keyword/SelectedKeywords';
import { SerpAnalysisPanel } from '@/components/content-builder/serp/SerpAnalysisPanel';
import { InitialStateView } from './InitialStateView';
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
  onAddToContent,
  onReanalyze
}) => {
  return (
    <div className="space-y-6">
      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="space-y-6">
            <KeywordSearch
              onSearch={onSearch}
              defaultKeyword={mainKeyword}
            />
            
            {selectedKeywords.length > 0 && (
              <SelectedKeywords
                keywords={selectedKeywords}
                onRemove={onRemoveKeyword}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {hasSearched ? (
        <SerpAnalysisPanel
          serpData={serpData}
          isLoading={isAnalyzing}
          mainKeyword={mainKeyword}
          onAddToContent={onAddToContent}
          onRetry={onReanalyze}
        />
      ) : (
        <InitialStateView />
      )}
    </div>
  );
};
