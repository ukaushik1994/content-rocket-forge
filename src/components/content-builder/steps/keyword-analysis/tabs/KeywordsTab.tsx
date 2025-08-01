
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { Tag, Plus, Check } from 'lucide-react';

interface KeywordsTabProps {
  keywords: string[];
  serpSelections: SerpSelection[];
  onToggleSelection: (type: string, content: string) => void;
}

export function KeywordsTab({ keywords, serpSelections, onToggleSelection }: KeywordsTabProps) {
  const isSelected = (keyword: string) => {
    return serpSelections.some(
      item => item.type === 'keyword' && 
               item.content === keyword && 
               item.selected
    );
  };

  const renderKeywordItem = (keyword: string, index: number) => {
    const selected = isSelected(keyword);
    
    return (
      <Card key={`keyword-${index}-${keyword}`} className={`transition-all ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Tag className="h-3 w-3 text-blue-500" />
              <span className="text-sm font-medium">{keyword}</span>
            </div>
            <Button
              variant={selected ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleSelection('keyword', keyword)}
            >
              {selected ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Selected
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  Select
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {keywords.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-500" />
              Secondary Keywords
              <Badge variant="outline">{keywords.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {keywords.map((keyword, index) => 
                renderKeywordItem(keyword, index)
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Tag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No keywords found</h3>
          <p className="text-muted-foreground">
            No additional keywords were found for this analysis
          </p>
        </div>
      )}
    </div>
  );
}
