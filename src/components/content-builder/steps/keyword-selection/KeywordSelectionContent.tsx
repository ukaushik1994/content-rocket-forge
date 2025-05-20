
import React from 'react';
import { KeywordSearch } from '@/components/content-builder/keyword/KeywordSearch';
import { KeywordInsightCard } from '@/components/content-builder/keyword/KeywordInsightCard';
import { KeywordSuggestionList } from '@/components/content-builder/keyword/KeywordSuggestionList';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface KeywordSelectionContentProps {
  mainKeyword: string;
  keywordSuggestions: string[];
  selectedKeyword: string;
  relatedKeywords: string[];
  isLoadingKeywordData: boolean;
  isAnalyzing: boolean;
  onKeywordSearch: (keyword: string, suggestions: string[]) => void;
  onKeywordSelect: (keyword: string) => void;
  onContinue: () => void;
}

export const KeywordSelectionContent: React.FC<KeywordSelectionContentProps> = ({
  mainKeyword,
  keywordSuggestions,
  selectedKeyword,
  relatedKeywords,
  isLoadingKeywordData,
  isAnalyzing,
  onKeywordSearch,
  onKeywordSelect,
  onContinue
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Keyword search input */}
      <KeywordSearch 
        initialKeyword={mainKeyword} 
        onKeywordSearch={onKeywordSearch} 
      />

      {/* Keyword suggestions list */}
      {keywordSuggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Keyword Suggestions</h3>
          <KeywordSuggestionList 
            keywords={keywordSuggestions}
            selectedKeyword={selectedKeyword}
            onKeywordSelect={onKeywordSelect}
          />
        </div>
      )}

      {/* Keyword insights */}
      {selectedKeyword && (
        <KeywordInsightCard 
          keyword={selectedKeyword}
          relatedKeywords={relatedKeywords}
          isLoading={isLoadingKeywordData}
        />
      )}

      {/* Continue button */}
      {selectedKeyword && (
        <div className="flex justify-end pt-4">
          <Button 
            onClick={onContinue}
            disabled={isAnalyzing || !selectedKeyword}
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
          >
            Continue to Analysis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
};
