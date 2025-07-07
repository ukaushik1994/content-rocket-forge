
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { Heading, Plus, Check } from 'lucide-react';

interface HeadingsTabProps {
  headings: any[];
  serpSelections: SerpSelection[];
  onToggleSelection: (type: string, content: string) => void;
}

export function HeadingsTab({ headings, serpSelections, onToggleSelection }: HeadingsTabProps) {
  const isSelected = (heading: string) => {
    return serpSelections.some(
      item => item.type === 'heading' && item.content === heading && item.selected
    );
  };

  if (headings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Heading className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No headings found</h3>
        <p className="text-muted-foreground">
          No competitor headings were extracted from the search results
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Competitor Headings</h3>
          <p className="text-sm text-muted-foreground">
            Select proven headings from top-ranking content
          </p>
        </div>
        <Badge variant="outline">
          {headings.length} headings
        </Badge>
      </div>

      <div className="space-y-3">
        {headings.map((heading, index) => {
          const headingText = typeof heading === 'string' ? heading : heading.text;
          const headingLevel = typeof heading === 'object' ? heading.level : 'h2';
          const headingSubtext = typeof heading === 'object' ? heading.subtext : '';
          const selected = isSelected(headingText);
          
          return (
            <Card key={index} className={`transition-all ${selected ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Heading className="h-4 w-4 text-teal-500" />
                      <Badge variant="outline" className="text-xs">
                        {headingLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="font-medium mb-1">{headingText}</p>
                    {headingSubtext && (
                      <p className="text-sm text-muted-foreground">
                        {headingSubtext.length > 150 ? 
                          `${headingSubtext.substring(0, 150)}...` : 
                          headingSubtext
                        }
                      </p>
                    )}
                  </div>
                  <Button
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    onClick={() => onToggleSelection('heading', headingText)}
                    className="ml-4"
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
        })}
      </div>
    </div>
  );
}
