
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface SelectedKeywordsProps {
  keywords: string[];
  onRemoveKeyword: (keyword: string) => void;
}

export const SelectedKeywords: React.FC<SelectedKeywordsProps> = ({
  keywords,
  onRemoveKeyword
}) => {
  if (keywords.length === 0) {
    return null;
  }

  return (
    <Card className="glass-panel border border-white/10 shadow-lg overflow-hidden">
      <CardHeader className="bg-white/5 backdrop-blur-md pb-3">
        <CardTitle className="text-base font-medium flex items-center">
          <span className="text-gradient">Selected Keywords</span>
          <Badge className="ml-2 bg-white/10 text-xs">{keywords.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <Badge 
              key={index} 
              className="bg-primary/20 text-primary-foreground hover:bg-primary/30 transition-all border border-primary/20 px-3 py-1 flex items-center gap-1 group animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {keyword}
              <button
                onClick={() => onRemoveKeyword(keyword)}
                className="ml-1 rounded-full hover:bg-white/10 p-0.5 transition-colors"
                aria-label="Remove keyword"
              >
                <X className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
