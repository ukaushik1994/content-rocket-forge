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
  return <Card>
      
      
    </Card>;
};