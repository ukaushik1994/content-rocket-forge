
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export interface SelectedKeywordsProps {
  keywords: string[];
  onRemoveKeyword: (keyword: string) => void;
}

export const SelectedKeywords = ({ keywords, onRemoveKeyword }: SelectedKeywordsProps) => {
  if (keywords.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No keywords selected yet
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword) => (
        <Badge
          key={keyword}
          variant="secondary"
          className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20"
        >
          {keyword}
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={() => onRemoveKeyword(keyword)}
          />
        </Badge>
      ))}
    </div>
  );
};
