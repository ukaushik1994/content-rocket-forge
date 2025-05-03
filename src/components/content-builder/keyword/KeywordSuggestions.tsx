
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Suggested Keywords</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Badge 
              key={index} 
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 flex items-center gap-1"
              onClick={() => onAddKeyword(suggestion)}
            >
              {suggestion}
              <Plus className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
