
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Tag className="h-4 w-4 text-blue-400" />
          Related Keywords
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((keyword, index) => (
            <motion.div
              key={keyword}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Badge 
                className="bg-blue-950/40 hover:bg-blue-900/60 text-blue-200 cursor-pointer group border-blue-500/20 transition-all duration-200"
                onClick={() => onAddKeyword(keyword)}
              >
                {keyword}
                <Plus className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Badge>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
