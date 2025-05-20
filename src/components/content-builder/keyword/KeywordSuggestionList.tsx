
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface KeywordSuggestionListProps {
  keywords: string[];
  selectedKeyword: string;
  onKeywordSelect: (keyword: string) => void;
}

export const KeywordSuggestionList: React.FC<KeywordSuggestionListProps> = ({
  keywords,
  selectedKeyword,
  onKeywordSelect
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className={cn(
            "rounded-full",
            selectedKeyword === keyword && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={() => onKeywordSelect(keyword)}
        >
          {keyword}
        </Button>
      ))}
      
      {keywords.length === 0 && (
        <p className="text-muted-foreground">No keyword suggestions available.</p>
      )}
    </div>
  );
};
