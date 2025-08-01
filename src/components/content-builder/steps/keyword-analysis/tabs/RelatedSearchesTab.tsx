
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { TrendingUp, Plus, Check } from 'lucide-react';

interface RelatedSearchesTabProps {
  relatedSearches: any[];
  serpSelections: SerpSelection[];
  onToggleSelection: (type: string, content: string) => void;
}

export function RelatedSearchesTab({ relatedSearches, serpSelections, onToggleSelection }: RelatedSearchesTabProps) {
  const isSelected = (searchText: string) => {
    return serpSelections.some(
      item => item.type === 'relatedSearch' && 
               item.content === searchText && 
               item.selected
    );
  };

  const renderRelatedSearchItem = (search: any, index: number) => {
    const searchText = typeof search === 'string' ? search : search.query;
    const searchVolume = typeof search === 'object' ? search.volume : undefined;
    const selected = isSelected(searchText);
    
    return (
      <Card key={`related-${index}-${searchText}`} className={`transition-all ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-sm font-medium">{searchText}</span>
              {searchVolume && (
                <Badge variant="outline" className="text-xs">
                  {searchVolume >= 1000 ? `${Math.round(searchVolume/1000)}K` : searchVolume}
                </Badge>
              )}
            </div>
            <Button
              variant={selected ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleSelection('relatedSearch', searchText)}
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
      {relatedSearches.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Related Searches
              <Badge variant="outline">{relatedSearches.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {relatedSearches.map((search, index) => 
                renderRelatedSearchItem(search, index)
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No related searches found</h3>
          <p className="text-muted-foreground">
            No related searches were found for this analysis
          </p>
        </div>
      )}
    </div>
  );
}
