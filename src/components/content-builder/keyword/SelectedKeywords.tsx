
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
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Selected Keywords</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {keywords.length === 0 ? (
            <p className="text-sm text-muted-foreground">No keywords selected yet.</p>
          ) : (
            keywords.map((kw, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="flex items-center gap-1"
              >
                {kw}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onRemoveKeyword(kw)}
                />
              </Badge>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
