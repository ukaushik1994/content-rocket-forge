
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface KeywordSuggestionsProps {
  suggestions: string[];
  onAddKeyword: (keyword: string) => void;
}

export const KeywordSuggestions: React.FC<KeywordSuggestionsProps> = ({
  suggestions,
  onAddKeyword
}) => {
  if (!suggestions.length) return null;
  
  return (
    <Card className="border-white/10 bg-black/20 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Related Keyword Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Badge 
              key={index}
              variant="outline"
              className="bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer group transition-all duration-200 hover:border-primary/30"
              onClick={() => onAddKeyword(suggestion)}
            >
              <span>{suggestion}</span>
              <Plus className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
