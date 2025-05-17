
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, HelpCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SelectedSerpItemsSidebar() {
  const { state, serpActions } = useContentBuilder();
  const { serpSelections } = state;
  
  const selectedItems = serpSelections.filter(item => item.selected);
  const hasSelectedItems = selectedItems.length > 0;
  
  // Function to get appropriate icon for item type
  const getItemTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'keyword':
        return <Search className="h-4 w-4 text-primary" />;
      case 'question':
        return <HelpCircle className="h-4 w-4 text-amber-400" />;
      default:
        return <FileText className="h-4 w-4 text-sky-400" />;
    }
  };
  
  // Handle toggling item selection
  const handleToggleSelection = (index: number) => {
    if (serpActions && serpActions.toggleSerpSelection) {
      serpActions.toggleSerpSelection(index);
    }
  };

  return (
    <Card className="border border-white/10 bg-gradient-to-br from-indigo-950/20 to-black/30 h-full">
      <CardHeader className="pb-2 border-b border-white/10 bg-white/5">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
              <Search className="h-3.5 w-3.5 text-white" />
            </div>
            Selected SERP Items
          </div>
          {hasSelectedItems && (
            <Badge variant="outline" className="bg-white/5 text-xs">
              {selectedItems.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <ScrollArea className="h-[500px] pr-4">
        <CardContent className="p-4">
          {!hasSelectedItems ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <FileText className="h-8 w-8 text-muted-foreground opacity-40 mb-2" />
              <p className="text-sm text-muted-foreground">No SERP items selected</p>
              <p className="text-xs text-muted-foreground mt-1">Selected items from SERP analysis will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedItems.map((item, index) => (
                <div 
                  key={index}
                  className="p-3 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => handleToggleSelection(serpSelections.findIndex(s => s === item))}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getItemTypeIcon(item.type)}
                      <Badge variant="outline" className="text-[10px]">
                        {item.type}
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelection(serpSelections.findIndex(s => s === item));
                      }}
                    >
                      <Check className="h-4 w-4 text-primary" />
                    </Button>
                  </div>
                  <p className="text-sm mt-2">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
