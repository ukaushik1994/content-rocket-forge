
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { Tag, Plus, Check, TrendingUp } from 'lucide-react';

interface KeywordsTabProps {
  keywords: string[];
  relatedSearches: any[];
  serpSelections: SerpSelection[];
  onToggleSelection: (type: string, content: string) => void;
}

export function KeywordsTab({ keywords, relatedSearches, serpSelections, onToggleSelection }: KeywordsTabProps) {
  const isSelected = (keyword: string, type: string) => {
    return serpSelections.some(
      item => (item.type === type || item.type === 'keyword') && 
               item.content === keyword && 
               item.selected
    );
  };

  const renderKeywordItem = (keyword: string, type: string, volume?: number, index?: number) => {
    const selected = isSelected(keyword, type);
    
    return (
      <Card key={`${type}-${index}-${keyword}`} className={`transition-all ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Tag className="h-3 w-3 text-blue-500" />
              <span className="text-sm font-medium">{keyword}</span>
              {volume && (
                <Badge variant="outline" className="text-xs">
                  {volume >= 1000 ? `${Math.round(volume/1000)}K` : volume}
                </Badge>
              )}
            </div>
            <Button
              variant={selected ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleSelection(type, keyword)}
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
      {/* Section Headers */}
      <div className="flex gap-4 border-b border-border">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-blue-500">
          <Tag className="h-5 w-5 text-blue-500" />
          <span className="font-medium">Secondary Keywords</span>
          <Badge variant="outline">{keywords.length}</Badge>
        </div>
        <div className="flex items-center gap-2 pb-2 border-b-2 border-transparent hover:border-green-500/50 transition-colors cursor-pointer">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <span className="font-medium">Related Searches</span>
          <Badge variant="outline">{relatedSearches.length}</Badge>
        </div>
      </div>

      {/* Keywords Section */}
      {keywords.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-2">
            {keywords.map((keyword, index) => 
              renderKeywordItem(keyword, 'keyword', undefined, index)
            )}
          </div>
        </div>
      )}

      {/* Related Searches Section */}
      {relatedSearches.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-2">
            {relatedSearches.map((search, index) => {
              const searchText = typeof search === 'string' ? search : search.query;
              const searchVolume = typeof search === 'object' ? search.volume : undefined;
              return renderKeywordItem(searchText, 'relatedSearch', searchVolume, index);
            })}
          </div>
        </div>
      )}

      {keywords.length === 0 && relatedSearches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Tag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No keywords found</h3>
          <p className="text-muted-foreground">
            No additional keywords or related searches were found for this analysis
          </p>
        </div>
      )}
    </div>
  );
}
